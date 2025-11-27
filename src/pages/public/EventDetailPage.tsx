import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../../services/events';
import { getVolunteerOpportunitiesByEventId } from '../../services/volunteers';
import { checkEnrollmentExists, createEnrollment } from '../../services/enrollments';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Event, VolunteerOpportunity } from '../../types';
import { Card, CardContent, Badge, Button, Spinner, Alert, MemberSelectionModal, EventVolunteerModal } from '../../components/ui';
import { CalendarIcon, MapPinIcon, ClockIcon, TicketIcon, ArrowDownTrayIcon, CheckCircleIcon, HandRaisedIcon } from '@heroicons/react/24/outline';

export const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { currentUser, familyData } = useAuth();
  const { addToCart } = useCart();
  const [eventData, setEventData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedTicketPrice, setSelectedTicketPrice] = useState<number>(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [volunteerOpportunity, setVolunteerOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [showVolunteerSignupPrompt, setShowVolunteerSignupPrompt] = useState(false);
  const [enrolledMemberIds, setEnrolledMemberIds] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      try {
        const data = await getEventById(eventId);
        setEventData(data);
        // Set default ticket price
        if (data && data.ticketTypes && data.ticketTypes.length > 0) {
          setSelectedTicketPrice(data.ticketTypes[0].price);
        }

        // Fetch volunteer opportunities if enabled
        if (data && data.volunteerEnabled) {
          const opportunities = await getVolunteerOpportunitiesByEventId(eventId);
          if (opportunities.length > 0) {
            setVolunteerOpportunity(opportunities[0]);
          }
        }
      } catch (err) {
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const checkUserEnrollment = async () => {
      if (!eventId || !familyData) {
        setCheckingEnrollment(false);
        return;
      }
      
      try {
        const enrolled = await checkEnrollmentExists(familyData.id, eventId, 'event');
        setIsEnrolled(enrolled);
      } catch (err) {
        console.error('Error checking enrollment:', err);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkUserEnrollment();
  }, [eventId, familyData]);

  const handleRegister = (ticketPrice?: number) => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    if (!familyData || familyData.members.length === 0) {
      setError('Please add family members to your profile before registering for events.');
      return;
    }

    if (ticketPrice !== undefined) {
      setSelectedTicketPrice(ticketPrice);
    }
    setShowMemberModal(true);
  };

  const handleMemberSelection = async (selectedMemberIds: string[]) => {
    if (!eventData || !eventId || !familyData) return;

    // Store enrolled member IDs for volunteer signup
    setEnrolledMemberIds(selectedMemberIds);

    // Check if the event is free (price is 0)
    const isFree = selectedTicketPrice === 0;

    if (isFree) {
      // For free events, enroll directly without going through cart/checkout
      setEnrolling(true);
      try {
        await createEnrollment({
          familyId: familyData.id,
          itemId: eventId,
          itemType: 'event',
          memberIds: selectedMemberIds,
          status: 'active',
          orderId: `FREE-${Date.now()}-${crypto.randomUUID()}`, // Generate unique ID for free enrollment
        });

        // Update enrollment status
        setIsEnrolled(true);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000);

        // Show volunteer signup prompt if volunteers are enabled
        if (eventData.volunteerEnabled && volunteerOpportunity) {
          setShowVolunteerSignupPrompt(true);
        }
      } catch (err) {
        console.error('Error enrolling in free event:', err);
        setError('Failed to enroll in event. Please try again.');
      } finally {
        setEnrolling(false);
      }
    } else {
      // For paid events, add to cart as usual
      addToCart({
        itemId: eventId,
        itemType: 'event',
        title: eventData.title,
        price: selectedTicketPrice,
        quantity: selectedMemberIds.length,
        memberIds: selectedMemberIds,
      });

      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);

      // Show volunteer signup prompt if volunteers are enabled
      if (eventData.volunteerEnabled && volunteerOpportunity) {
        setShowVolunteerSignupPrompt(true);
      }
    }
  };

  const handleVolunteerSignupSuccess = async () => {
    // Refresh volunteer opportunity data after successful signup
    if (eventId) {
      try {
        const opportunities = await getVolunteerOpportunitiesByEventId(eventId);
        if (opportunities.length > 0) {
          setVolunteerOpportunity(opportunities[0]);
        }
      } catch (err) {
        console.error('Error refreshing volunteer data:', err);
      }
    }
    // Don't close the modal - let the user continue signing up or click "Confirm Signup"
  };

  const handleVolunteerPromptClose = () => {
    // If volunteering is required, don't allow closing without signing up
    if (eventData?.volunteerRequired) {
      // Check if user has signed up for any slot
      const hasSignedUp = volunteerOpportunity?.slots.some(slot =>
        slot.signups.some(signup =>
          signup.userId === currentUser?.uid || signup.email === currentUser?.email
        )
      );
      
      if (!hasSignedUp) {
        alert('Volunteering is required for this event. Please sign up for a volunteer slot.');
        return;
      }
    }
    setShowVolunteerSignupPrompt(false);
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="container-custom py-12">
        <Alert type="error" message={error || 'Event not found'} />
      </div>
    );
  }

  const spotsRemaining = eventData.capacity ? eventData.capacity - eventData.registered : null;
  const isFull = spotsRemaining !== null && spotsRemaining <= 0;
  const hasTickets = eventData.ticketTypes && eventData.ticketTypes.length > 0;
  const minPrice = hasTickets ? Math.min(...eventData.ticketTypes.map(t => t.price)) : 0;
  const isMember = familyData?.membershipStatus === 'active';
  const canPurchase = isMember || eventData.allowNonMembers !== false;

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Image */}
        {eventData.imageURL && (
          <div className="relative h-96 mb-8 rounded-xl overflow-hidden">
            <img
              src={eventData.imageURL}
              alt={eventData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <Badge 
                variant={
                  eventData.status === 'upcoming' ? 'success' :
                  eventData.status === 'ongoing' ? 'warning' :
                  'neutral'
                }
                className="mb-4"
              >
                {eventData.status}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{eventData.title}</h1>
            </div>
          </div>
        )}

        {!eventData.imageURL && (
          <div className="mb-8">
            <Badge 
              variant={
                eventData.status === 'upcoming' ? 'success' :
                eventData.status === 'ongoing' ? 'warning' :
                'neutral'
              }
              className="mb-4"
            >
              {eventData.status}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              {eventData.title}
            </h1>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details Card */}
            <Card>
              <CardContent>
                <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Event Details</h2>
                
                <div className="space-y-5">
                  <div className="flex items-start">
                    <CalendarIcon className="h-6 w-6 text-primary-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-neutral-900 mb-1">Date</p>
                      <p className="text-lg text-neutral-700">
                        {eventData.date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <ClockIcon className="h-6 w-6 text-primary-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-neutral-900 mb-1">Time</p>
                      <p className="text-lg text-neutral-700">
                        {eventData.startTime} - {eventData.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPinIcon className="h-6 w-6 text-primary-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-neutral-900 mb-1">Location</p>
                      <p className="text-lg text-neutral-700">{eventData.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description Card */}
            <Card>
              <CardContent>
                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">About This Event</h2>
                <div className="prose max-w-none">
                  <p className="text-neutral-700 text-lg leading-relaxed whitespace-pre-wrap">
                    {eventData.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Flyer Download */}
            {eventData.flyerURL && (
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ArrowDownTrayIcon className="h-8 w-8 text-primary-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-neutral-900">Event Flyer</h3>
                        <p className="text-sm text-neutral-600">Download for more information</p>
                      </div>
                    </div>
                    <a
                      href={eventData.flyerURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Button variant="outline">
                        Download
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Volunteer Opportunities - Show if enabled and user is enrolled */}
            {eventData.volunteerEnabled && isEnrolled && !checkingEnrollment && volunteerOpportunity && (
              <Card className="border-l-4 border-l-primary-600">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <HandRaisedIcon className="h-8 w-8 text-primary-600 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-neutral-900 text-xl mb-2">
                          Volunteer for This Event
                        </h3>
                        <p className="text-neutral-600 mb-4">
                          Help make this event a success! We're looking for volunteers to assist with various tasks.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {volunteerOpportunity.slots.map((slot) => {
                            const spotsLeft = slot.capacity - slot.signups.length;
                            return (
                              <Badge 
                                key={slot.id} 
                                variant={spotsLeft > 0 ? 'info' : 'neutral'}
                              >
                                {slot.name}: {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowVolunteerModal(true)}
                    className="w-full"
                  >
                    View Volunteer Opportunities
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Registration */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent>
                {hasTickets ? (
                  <>
                    <div className="text-center mb-6 pb-6 border-b border-neutral-200">
                      <p className="text-sm text-neutral-600 mb-1">Starting from</p>
                      <p className="text-4xl font-bold text-primary-600">
                        ${minPrice}
                      </p>
                    </div>

                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center">
                      <TicketIcon className="h-5 w-5 mr-2" />
                      Ticket Types
                    </h3>

                    <div className="space-y-3 mb-6">
                      {eventData.ticketTypes.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-neutral-900">{ticket.name}</p>
                              {ticket.description && (
                                <p className="text-sm text-neutral-600 mt-1">
                                  {ticket.description}
                                </p>
                              )}
                            </div>
                            <p className="font-bold text-primary-600 ml-3">
                              ${ticket.price}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => handleRegister(ticket.price)}
                            disabled={isFull || !canPurchase || enrolling}
                            isLoading={enrolling && selectedTicketPrice === ticket.price}
                          >
                            {isFull ? 'Event Full' : !canPurchase ? 'Membership Required' : 'Register'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-6 pb-6 border-b border-neutral-200">
                      <p className="text-4xl font-bold text-primary-600">FREE</p>
                      <p className="text-sm text-neutral-600 mt-1">No registration fee</p>
                    </div>

                    {!canPurchase && currentUser && (
                      <div className="mb-4">
                        <Alert 
                          type="warning" 
                          message="Active membership required to register for this event"
                        />
                      </div>
                    )}

                    {addedToCart ? (
                      <div className="w-full mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center text-green-700">
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        <span className="font-medium">
                          {minPrice === 0 ? 'Enrolled Successfully!' : 'Added to Cart!'}
                        </span>
                      </div>
                    ) : (
                      <Button
                        className="w-full mb-4"
                        onClick={() => handleRegister(0)}
                        disabled={isFull || !canPurchase || enrolling}
                        isLoading={enrolling}
                      >
                        {isFull ? 'Event Full' : !canPurchase ? 'Membership Required' : 'Register Now'}
                      </Button>
                    )}

                    {/* Only show View Cart button if the event is not free */}
                    {minPrice > 0 && (
                      <Button
                        variant="outline"
                        className="w-full mb-4"
                        onClick={() => navigate('/cart')}
                      >
                        View Cart
                      </Button>
                    )}
                  </>
                )}

                {eventData.capacity && (
                  <div className="pt-6 border-t border-neutral-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-700">Spots Available</span>
                      <Badge 
                        variant={
                          isFull ? 'danger' : 
                          spotsRemaining && spotsRemaining < 10 ? 'warning' : 
                          'success'
                        }
                      >
                        {isFull ? 'Full' : `${spotsRemaining} left`}
                      </Badge>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(eventData.registered / eventData.capacity) * 100}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-neutral-600 mt-2 text-center">
                      {eventData.registered} registered / {eventData.capacity} capacity
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/events')}
                  >
                    ← Back to Events
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Member Selection Modal */}
      {familyData && (
        <MemberSelectionModal
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          members={familyData.members}
          onConfirm={handleMemberSelection}
          title={eventData?.title || 'Event'}
          itemType="event"
        />
      )}

      {/* Volunteer Opportunities Modal - For enrolled users viewing from detail page */}
      <EventVolunteerModal
        isOpen={showVolunteerModal}
        onClose={() => setShowVolunteerModal(false)}
        opportunity={volunteerOpportunity}
        onSignupSuccess={handleVolunteerSignupSuccess}
        enrolledMemberIds={enrolledMemberIds}
      />

      {/* Volunteer Signup Prompt Modal - Shows after adding to cart */}
      <EventVolunteerModal
        isOpen={showVolunteerSignupPrompt}
        onClose={handleVolunteerPromptClose}
        opportunity={volunteerOpportunity}
        onSignupSuccess={handleVolunteerSignupSuccess}
        isRequired={eventData?.volunteerRequired || false}
        isSignupPrompt={true}
        enrolledMemberIds={enrolledMemberIds}
      />
    </div>
  );
};

