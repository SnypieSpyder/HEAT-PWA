import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { Alert } from './Alert';
import { ConfirmModal } from './ConfirmModal';
import { VolunteerOpportunity, VolunteerSlot, FamilyMember } from '../../types';
import { addVolunteerSignup, removeVolunteerSignup } from '../../services/volunteers';
import { useAuth } from '../../contexts/AuthContext';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface EventVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: VolunteerOpportunity | null;
  onSignupSuccess?: () => void;
  isRequired?: boolean; // Whether volunteering is required (blocks closing without signup)
  isSignupPrompt?: boolean; // Whether this is shown as a signup prompt after adding to cart
  enrolledMemberIds?: string[]; // IDs of family members enrolled in the event
}

export const EventVolunteerModal: React.FC<EventVolunteerModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onSignupSuccess,
  isRequired = false,
  isSignupPrompt = false,
  enrolledMemberIds = [],
}) => {
  const { familyData } = useAuth();
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<VolunteerSlot | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<FamilyMember[]>([]); // Changed to array for multi-select
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removalData, setRemovalData] = useState<{ slotId: string; signupId: string; memberName: string } | null>(null);

  // Get enrolled members from family data
  const enrolledMembers = familyData?.members.filter(m => 
    enrolledMemberIds.length > 0 ? enrolledMemberIds.includes(m.id) : true
  ) || [];

  // Reset selection states when opportunity data changes (after signup/removal)
  // This ensures the UI updates properly without remounting the component
  useEffect(() => {
    if (opportunity && !showMemberSelection) {
      // Only reset if we're not in the member selection view
      setSelectedSlot(null);
      setSelectedMembers([]);
    }
  }, [opportunity?.slots, showMemberSelection]);

  const handleSignupClick = (slot: VolunteerSlot) => {
    setSelectedSlot(slot);
    setSelectedMembers([]); // Reset selection
    setAlert(null);
    
    // Show member selection for any number of members
    if (enrolledMembers.length > 0) {
      setShowMemberSelection(true);
    } else {
      setAlert({ type: 'error', message: 'No family members found for signup.' });
    }
  };

  const handleToggleMember = (member: FamilyMember) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(m => m.id === member.id);
      if (isSelected) {
        return prev.filter(m => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleConfirmSignup = async () => {
    if (!selectedSlot || !opportunity || selectedMembers.length === 0) return;

    setSubmitting(true);
    const successfulSignups: string[] = [];
    const failedSignups: string[] = [];

    try {
      // Sign up all selected members
      for (const member of selectedMembers) {
        try {
          await addVolunteerSignup(
            opportunity.id,
            selectedSlot.id,
            {
              slotId: selectedSlot.id,
              userId: member.id,
              name: `${member.firstName} ${member.lastName}`,
              email: member.email || '', // Don't fall back to parent's email for children
              phone: member.phone || '',
              addedBy: 'self',
            }
          );
          successfulSignups.push(member.firstName);
        } catch (error: any) {
          console.error(`Error signing up ${member.firstName}:`, error);
          failedSignups.push(`${member.firstName} (${error.message})`);
        }
      }

      // Show success/error messages
      if (successfulSignups.length > 0) {
        const names = successfulSignups.join(', ');
        setAlert({ 
          type: 'success', 
          message: `${names} ${successfulSignups.length === 1 ? 'has' : 'have'} been signed up to volunteer!` 
        });
      }
      
      if (failedSignups.length > 0) {
        setAlert({ 
          type: 'error', 
          message: `Failed to sign up: ${failedSignups.join(', ')}` 
        });
      }

      // Return to slot list instead of closing modal
      setShowMemberSelection(false);
      setSelectedSlot(null);
      setSelectedMembers([]);
      
      if (onSignupSuccess && successfulSignups.length > 0) {
        onSignupSuccess();
      }
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const isMemberSignedUpForSlot = (slot: VolunteerSlot, memberId: string) => {
    return slot.signups.some(signup => signup.userId === memberId);
  };

  const getMemberSignupForSlot = (slot: VolunteerSlot, memberId: string) => {
    return slot.signups.find(signup => signup.userId === memberId);
  };

  const isFamilySignedUpForSlot = (slot: VolunteerSlot) => {
    // Check if any enrolled family member is signed up
    return enrolledMembers.some(member => isMemberSignedUpForSlot(slot, member.id));
  };

  const handleRemoveClick = (slotId: string, signupId: string, memberName: string) => {
    setRemovalData({ slotId, signupId, memberName });
    setShowRemoveConfirm(true);
  };

  const handleConfirmRemove = async () => {
    if (!opportunity || !removalData) return;

    setSubmitting(true);
    try {
      await removeVolunteerSignup(opportunity.id, removalData.slotId, removalData.signupId);
      setAlert({ type: 'success', message: `${removalData.memberName} has been removed from the volunteer slot.` });
      
      if (onSignupSuccess) {
        onSignupSuccess();
      }
      
      // Auto-dismiss success message
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error removing signup:', error);
      setAlert({ type: 'error', message: 'Failed to remove signup. Please try again.' });
    } finally {
      setSubmitting(false);
      setShowRemoveConfirm(false);
      setRemovalData(null);
    }
  };

  const isSlotFull = (slot: VolunteerSlot) => {
    return slot.signups.length >= slot.capacity;
  };

  const handleClose = () => {
    setShowMemberSelection(false);
    setSelectedSlot(null);
    setSelectedMembers([]);
    setAlert(null);
    setShowRemoveConfirm(false);
    setRemovalData(null);
    onClose();
  };

  if (!opportunity) return null;

  return (
    <>
    <Modal isOpen={isOpen} onClose={handleClose} title="Volunteer Opportunities" size="lg">
      <div className="space-y-4">
        {/* Signup Prompt Message */}
        {isSignupPrompt && (
          <div className={`rounded-lg p-4 ${isRequired ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm font-medium ${isRequired ? 'text-yellow-900' : 'text-blue-900'}`}>
              {isRequired 
                ? '⚠️ Volunteering Required: You must sign up for a volunteer slot to participate in this event.'
                : '🙌 Help us out! Consider signing up for a volunteer slot to support this event.'}
            </p>
          </div>
        )}

        {/* Event Info */}
        <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-neutral-900">{opportunity.title}</h3>
          <p className="text-sm text-neutral-600">{opportunity.description}</p>
          
          <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mt-3">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-primary-600" />
              <span>
                {opportunity.date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2 text-primary-600" />
              <span>{opportunity.startTime} - {opportunity.endTime}</span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-2 text-primary-600" />
              <span>{opportunity.location}</span>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}

        {/* Member Selection or Slot List */}
        {showMemberSelection && selectedSlot ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-neutral-900 mb-1">
                Signing up for: {selectedSlot.name}
              </h4>
              <p className="text-sm text-neutral-600">When: {selectedSlot.when}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Select family member(s) to volunteer {enrolledMembers.length > 1 && '(You can select multiple)'}
              </label>
              <div className="space-y-2">
                {enrolledMembers.map((member) => {
                  const alreadySignedUp = isMemberSignedUpForSlot(selectedSlot, member.id);
                  const isSelected = selectedMembers.some(m => m.id === member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleToggleMember(member)}
                      disabled={alreadySignedUp}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : alreadySignedUp
                          ? 'border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed'
                          : 'border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UserIcon className="h-5 w-5 text-neutral-600" />
                          <div>
                            <p className="font-medium text-neutral-900">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-neutral-600">{member.relationship}</p>
                          </div>
                        </div>
                        {alreadySignedUp ? (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircleIcon className="h-3 w-3" />
                            Already Signed Up
                          </Badge>
                        ) : isSelected ? (
                          <Badge variant="primary">Selected</Badge>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowMemberSelection(false);
                  setSelectedSlot(null);
                  setSelectedMembers([]);
                }}
                disabled={submitting}
              >
                Back
              </Button>
              <Button 
                onClick={handleConfirmSignup} 
                isLoading={submitting}
                disabled={selectedMembers.length === 0}
              >
                Confirm {selectedMembers.length > 0 && `(${selectedMembers.length})`}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Available Volunteer Slots</h4>
              <div className="space-y-3">
                {opportunity.slots.map((slot) => {
                  const isFull = isSlotFull(slot);
                  const familySignedUp = isFamilySignedUpForSlot(slot);
                  const spotsLeft = slot.capacity - slot.signups.length;

                  // Show which family members are signed up for this slot
                  const signedUpMembers = enrolledMembers.filter(member => 
                    isMemberSignedUpForSlot(slot, member.id)
                  );

                  return (
                    <div
                      key={slot.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        familySignedUp
                          ? 'border-green-300 bg-green-50'
                          : isFull
                          ? 'border-neutral-200 bg-neutral-50'
                          : 'border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-neutral-900">{slot.name}</h5>
                            {isFull && !familySignedUp && (
                              <Badge variant="neutral">Full</Badge>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 mb-2">When: {slot.when}</p>
                          <div className="flex items-center text-sm text-neutral-600 mb-2">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            <span>
                              {slot.signups.length} / {slot.capacity} volunteers
                              {!isFull && ` (${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left)`}
                            </span>
                          </div>
                          
                          {/* Show signed up family members with remove option */}
                          {signedUpMembers.length > 0 && (
                            <div className="space-y-1 mt-2">
                              {signedUpMembers.map(member => {
                                const signup = getMemberSignupForSlot(slot, member.id);
                                if (!signup) return null;
                                return (
                                  <div key={member.id} className="flex items-center justify-between bg-white px-2 py-1 rounded">
                                    <div className="flex items-center gap-2">
                                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                      <span className="text-sm font-medium text-green-800">
                                        {member.firstName} signed up
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveClick(slot.id, signup.id, member.firstName)}
                                      disabled={submitting}
                                      className="text-xs text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          {isFull && !familySignedUp ? (
                            <Button size="sm" variant="outline" disabled>
                              Full
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleSignupClick(slot)}
                              disabled={submitting}
                            >
                              Sign Up
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 mt-6">
              {isSignupPrompt && !isRequired && (
                <Button variant="outline" onClick={handleClose}>
                  Skip for Now
                </Button>
              )}
              {!isSignupPrompt && (
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              )}
              {isSignupPrompt && (
                <Button onClick={handleClose}>
                  Confirm Signup
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>

    {/* Remove Confirmation Modal */}
    <ConfirmModal
      isOpen={showRemoveConfirm}
      onClose={() => {
        setShowRemoveConfirm(false);
        setRemovalData(null);
      }}
      onConfirm={handleConfirmRemove}
      title="Remove Volunteer"
      message={`Remove ${removalData?.memberName} from this volunteer slot?`}
      confirmText="Remove"
      cancelText="Cancel"
      variant="warning"
      isLoading={submitting}
    />
    </>
  );
};

