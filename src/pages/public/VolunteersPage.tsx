import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { VolunteerOpportunity, VolunteerSlot } from '../../types';
import { getActiveVolunteerOpportunities, addVolunteerSignup } from '../../services/volunteers';
import { useAuth } from '../../contexts/AuthContext';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export const VolunteersPage: React.FC = () => {
  const { currentUser, familyData } = useAuth();
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    opportunity: VolunteerOpportunity;
    slot: VolunteerSlot;
  } | null>(null);
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    // Pre-fill form if user is logged in
    if (currentUser && familyData && familyData.members.length > 0) {
      const primaryContact = familyData.members.find((m) => m.id === familyData.primaryContactId);
      if (primaryContact) {
        setSignupForm({
          name: `${primaryContact.firstName} ${primaryContact.lastName}`,
          email: primaryContact.email || currentUser.email || '',
          phone: primaryContact.phone || '',
        });
      }
    }
  }, [currentUser, familyData]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await getActiveVolunteerOpportunities();
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setAlert({ type: 'error', message: 'Failed to load volunteer opportunities' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = (opportunity: VolunteerOpportunity, slot: VolunteerSlot) => {
    setSelectedSlot({ opportunity, slot });
    setShowSignupModal(true);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    try {
      await addVolunteerSignup(
        selectedSlot.opportunity.id,
        selectedSlot.slot.id,
        {
          slotId: selectedSlot.slot.id,
          userId: currentUser?.uid,
          name: signupForm.name,
          email: signupForm.email,
          phone: signupForm.phone,
          addedBy: 'self',
        }
      );

      setAlert({ type: 'success', message: 'Thank you for signing up to volunteer!' });
      setShowSignupModal(false);
      setSelectedSlot(null);
      fetchOpportunities();
    } catch (error) {
      console.error('Error signing up:', error);
      setAlert({ type: 'error', message: 'Failed to sign up. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const isUserSignedUpForSlot = (slot: VolunteerSlot) => {
    if (!currentUser) return false;
    return slot.signups.some(signup => 
      signup.userId === currentUser.uid || signup.email === currentUser.email
    );
  };

  const isUserSignedUpForOpportunity = (opportunity: VolunteerOpportunity) => {
    if (!currentUser) return false;
    return opportunity.slots.some(slot =>
      slot.signups.some(signup => 
        signup.userId === currentUser.uid || signup.email === currentUser.email
      )
    );
  };

  const isSloFull = (slot: VolunteerSlot) => {
    return slot.signups.length >= slot.capacity;
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-5xl mx-auto">
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Volunteer Opportunities</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Make a difference in our community! Sign up to volunteer for upcoming events and activities.
          </p>
        </div>

        {opportunities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <UserGroupIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 text-lg">
                No volunteer opportunities available at the moment.
              </p>
              <p className="text-neutral-500 text-sm mt-2">
                Check back soon for new opportunities to help out!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
                  <p className="text-neutral-600 mt-2">{opportunity.description}</p>
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-neutral-600">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-primary-600" />
                      <span className="font-medium">
                        {opportunity.date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-primary-600" />
                      <span>{opportunity.startTime} - {opportunity.endTime}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-2 text-primary-600" />
                      <span>{opportunity.location}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-neutral-900 mb-3">Available Volunteer Slots:</h3>
                  {isUserSignedUpForOpportunity(opportunity) && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        ✓ You're signed up for a slot in this opportunity. You can only sign up for one slot per opportunity.
                      </p>
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {opportunity.slots.map((slot) => {
                      const signedUpForThisSlot = isUserSignedUpForSlot(slot);
                      const signedUpForAnySlot = isUserSignedUpForOpportunity(opportunity);
                      const full = isSloFull(slot);
                      const available = slot.capacity - slot.signups.length;

                      return (
                        <div
                          key={slot.id}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            signedUpForThisSlot
                              ? 'border-green-500 bg-green-50'
                              : full || (signedUpForAnySlot && !signedUpForThisSlot)
                              ? 'border-neutral-200 bg-neutral-50'
                              : 'border-neutral-300 hover:border-primary-500 hover:shadow-md'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-neutral-900">{slot.name}</h4>
                            {signedUpForThisSlot && (
                              <CheckCircleIcon className="h-6 w-6 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 mb-3">{slot.when}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-600">
                              <span className="font-medium">{available}</span> of{' '}
                              <span className="font-medium">{slot.capacity}</span> spots left
                            </span>
                            {signedUpForThisSlot ? (
                              <span className="text-sm font-medium text-green-700">
                                You're signed up!
                              </span>
                            ) : full ? (
                              <span className="text-sm font-medium text-neutral-500">Full</span>
                            ) : !currentUser ? (
                              <span className="text-xs text-neutral-500">Login to sign up</span>
                            ) : signedUpForAnySlot ? (
                              <span className="text-xs text-neutral-500">Already signed up</span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleSignupClick(opportunity, slot)}
                              >
                                Sign Up
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Signup Modal */}
        <Modal
          isOpen={showSignupModal}
          onClose={() => {
            setShowSignupModal(false);
            setSelectedSlot(null);
          }}
          title="Volunteer Sign Up"
        >
          {selectedSlot && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="bg-primary-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-neutral-900">{selectedSlot.opportunity.title}</h3>
                <p className="text-sm text-neutral-700 mt-1">
                  <strong>Slot:</strong> {selectedSlot.slot.name}
                </p>
                <p className="text-sm text-neutral-700">
                  <strong>When:</strong> {selectedSlot.slot.when}
                </p>
              </div>

              <p className="text-sm text-neutral-600">
                Please provide your contact information so we can keep you updated about this volunteer opportunity.
              </p>

              <Input
                label="Full Name"
                required
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
              />

              <Input
                label="Email"
                type="email"
                required
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
              />

              <Input
                label="Phone Number"
                type="tel"
                required
                value={signupForm.phone}
                onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSignupModal(false);
                    setSelectedSlot(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                  Confirm Sign Up
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
};

