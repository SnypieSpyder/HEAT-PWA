import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { FamilyMember } from '../../types';
import { UserIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface MemberSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onConfirm: (selectedMemberIds: string[]) => void;
  title: string;
  itemType: 'class' | 'sport' | 'event';
  enrolledMemberIds?: string[];
  waitlistedMemberIds?: string[];
  allowParents?: boolean;
}

interface MemberEligibility {
  eligible: boolean;
  reason?: string;
}

export const MemberSelectionModal: React.FC<MemberSelectionModalProps> = ({
  isOpen,
  onClose,
  members,
  onConfirm,
  title,
  itemType,
  enrolledMemberIds = [],
  waitlistedMemberIds = [],
  allowParents = true, // Default to true for backward compatibility (events allow all)
}) => {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Determine eligibility for each member
  const memberEligibility = useMemo(() => {
    const eligibilityMap = new Map<string, MemberEligibility>();

    members.forEach((member) => {
      // Check if already enrolled
      if (enrolledMemberIds.includes(member.id)) {
        eligibilityMap.set(member.id, {
          eligible: false,
          reason: 'Already enrolled',
        });
        return;
      }

      // Check if already on waitlist
      if (waitlistedMemberIds.includes(member.id)) {
        eligibilityMap.set(member.id, {
          eligible: false,
          reason: 'Already on waitlist',
        });
        return;
      }

      // Check if parent/guardian when not allowed
      if (!allowParents && (member.relationship === 'parent' || member.relationship === 'guardian')) {
        eligibilityMap.set(member.id, {
          eligible: false,
          reason: 'Only children can enroll',
        });
        return;
      }

      // Member is eligible
      eligibilityMap.set(member.id, { eligible: true });
    });

    return eligibilityMap;
  }, [members, enrolledMemberIds, waitlistedMemberIds, allowParents]);

  // Count eligible members
  const eligibleMembers = useMemo(() => {
    return members.filter((member) => memberEligibility.get(member.id)?.eligible);
  }, [members, memberEligibility]);

  const handleToggleMember = (memberId: string) => {
    const eligibility = memberEligibility.get(memberId);
    if (!eligibility?.eligible) return;

    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleConfirm = () => {
    if (selectedMemberIds.length === 0) {
      return;
    }
    onConfirm(selectedMemberIds);
    setSelectedMemberIds([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedMemberIds([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add ${title} to Cart`}>
      <div className="space-y-4">
        <p className="text-neutral-600">
          Select which family members you want to enroll in this {itemType}:
        </p>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {members.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <UserIcon className="h-12 w-12 mx-auto mb-2 text-neutral-400" />
              <p>No family members found.</p>
              <p className="text-sm mt-1">Please add family members to your profile first.</p>
            </div>
          ) : eligibleMembers.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <ExclamationCircleIcon className="h-12 w-12 mx-auto mb-2 text-amber-500" />
              <p className="font-medium text-neutral-700">No eligible family members</p>
              <p className="text-sm mt-1">
                All family members are either already enrolled, on the waitlist, or not eligible for this {itemType}.
              </p>
            </div>
          ) : (
            members.map((member) => {
              const eligibility = memberEligibility.get(member.id);
              const isEligible = eligibility?.eligible ?? false;
              const isSelected = selectedMemberIds.includes(member.id);

              return (
                <label
                  key={member.id}
                  className={`flex items-center p-4 border-2 rounded-lg transition-colors ${
                    isEligible
                      ? 'cursor-pointer hover:border-primary-600'
                      : 'cursor-not-allowed bg-neutral-50 opacity-60'
                  } ${isSelected ? 'border-primary-600 bg-primary-50' : 'border-neutral-200'}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleMember(member.id)}
                    disabled={!isEligible}
                    className={`w-5 h-5 border-neutral-300 rounded focus:ring-primary-500 ${
                      isEligible ? 'text-primary-600' : 'text-neutral-300'
                    }`}
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      {member.photoURL && (
                        <img
                          src={member.photoURL}
                          alt={`${member.firstName} ${member.lastName}`}
                          className={`w-10 h-10 rounded-full mr-3 object-cover ${
                            !isEligible ? 'grayscale' : ''
                          }`}
                        />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${isEligible ? 'text-neutral-900' : 'text-neutral-500'}`}>
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-neutral-600 capitalize">
                          {member.relationship}
                          {member.gradeLevel && ` • Grade ${member.gradeLevel}`}
                        </p>
                        {!isEligible && eligibility?.reason && (
                          <p className="text-xs text-amber-600 mt-1 font-medium">
                            {eligibility.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>

        {members.length > 0 && eligibleMembers.length > 0 && (
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600 mb-4">
              {selectedMemberIds.length === 0 ? (
                <span className="text-red-600">Please select at least one family member</span>
              ) : (
                <span>
                  {selectedMemberIds.length} member{selectedMemberIds.length !== 1 ? 's' : ''}{' '}
                  selected
                </span>
              )}
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedMemberIds.length === 0}
                className="flex-1"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        )}

        {members.length > 0 && eligibleMembers.length === 0 && (
          <div className="pt-4 border-t border-neutral-200">
            <Button variant="outline" onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
