import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSportById } from '../../services/sports';
import { createEnrollment } from '../../services/enrollments';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Sport } from '../../types';
import { Card, CardContent, Badge, Button, Spinner, Alert, LocationMapModal, MemberSelectionModal } from '../../components/ui';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserIcon, 
  ClockIcon,
  TrophyIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { joinWaitlist, checkWaitlistStatus } from '../../services/waitlist';

export const SportDetailPage: React.FC = () => {
  const { sportId } = useParams<{ sportId: string }>();
  const navigate = useNavigate();
  const { currentUser, familyData } = useAuth();
  const { addToCart } = useCart();
  const [sportData, setSportData] = useState<Sport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);
  const [waitlistStatus, setWaitlistStatus] = useState<any>(null);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchSport = async () => {
      if (!sportId) return;
      
      try {
        const data = await getSportById(sportId);
        setSportData(data);

        // Check if user is on waitlist
        if (familyData) {
          const status = await checkWaitlistStatus(sportId, 'sport', familyData.id);
          setWaitlistStatus(status);
        }
      } catch (err) {
        setError('Failed to load sport details');
      } finally {
        setLoading(false);
      }
    };

    fetchSport();
  }, [sportId, familyData]);

  const handleAddToCart = () => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    if (!familyData || familyData.members.length === 0) {
      setError('Please add family members to your profile before enrolling in sports.');
      return;
    }

    setShowMemberModal(true);
  };

  const handleMemberSelection = async (selectedMemberIds: string[]) => {
    if (!sportData || !sportId || !familyData) return;

    // Check if the sport is free (price is 0)
    const isFree = sportData.pricing === 0;

    if (isFree) {
      // For free sports, enroll directly without going through cart/checkout
      setEnrolling(true);
      try {
        await createEnrollment({
          familyId: familyData.id,
          itemId: sportId,
          itemType: 'sport',
          memberIds: selectedMemberIds,
          status: 'active',
          orderId: `FREE-${Date.now()}-${crypto.randomUUID()}`, // Generate unique ID for free enrollment
        });

        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000);
      } catch (err) {
        console.error('Error enrolling in free sport:', err);
        setError('Failed to enroll in sport. Please try again.');
      } finally {
        setEnrolling(false);
      }
    } else {
      // For paid sports, add to cart as usual
      addToCart({
        itemId: sportId,
        itemType: 'sport',
        title: sportData.title,
        price: sportData.pricing,
        quantity: selectedMemberIds.length,
        memberIds: selectedMemberIds,
      });

      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const handleJoinWaitlist = () => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    if (!familyData || familyData.members.length === 0) {
      setError('Please add family members to your profile before joining the waitlist.');
      return;
    }

    setShowWaitlistModal(true);
  };

  const handleWaitlistConfirm = async (selectedMemberIds: string[]) => {
    if (!sportId || !familyData) return;

    setJoiningWaitlist(true);
    try {
      await joinWaitlist(sportId, 'sport', familyData.id, selectedMemberIds);
      const status = await checkWaitlistStatus(sportId, 'sport', familyData.id);
      setWaitlistStatus(status);
      setShowWaitlistModal(false);
      setJoinedWaitlist(true);
      setTimeout(() => setJoinedWaitlist(false), 3000);
    } catch (err) {
      setError('Failed to join waitlist. Please try again.');
    } finally {
      setJoiningWaitlist(false);
    }
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

  if (error || !sportData) {
    return (
      <div className="container-custom py-12">
        <Alert type="error" message={error || 'Sport program not found'} />
      </div>
    );
  }

  const spotsRemaining = sportData.capacity - sportData.enrolled;
  const isFull = spotsRemaining <= 0;
  const enrollmentPercentage = (sportData.enrolled / sportData.capacity) * 100;
  const isMember = familyData?.membershipStatus === 'active';

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        {sportData.imageURL && (
          <div className="relative h-96 mb-8 rounded-xl overflow-hidden">
            <img
              src={sportData.imageURL}
              alt={sportData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="primary" className="text-white border-white">
                  {sportData.sportType}
                </Badge>
                <Badge variant="info" className="text-white border-white">
                  {sportData.season}
                </Badge>
                {sportData.skillLevel && (
                  <Badge variant="neutral" className="text-white border-white">
                    {sportData.skillLevel}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{sportData.title}</h1>
            </div>
          </div>
        )}

        {!sportData.imageURL && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="primary">{sportData.sportType}</Badge>
              <Badge variant="info">{sportData.season}</Badge>
              {sportData.skillLevel && (
                <Badge variant="neutral">{sportData.skillLevel}</Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              {sportData.title}
            </h1>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardContent>
                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                  About This Program
                </h2>
                <div className="prose max-w-none">
                  <p className="text-neutral-700 text-lg leading-relaxed whitespace-pre-wrap">
                    {sportData.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Program Details Card */}
            <Card>
              <CardContent>
                <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                  Program Details
                </h2>
                
                <div className="space-y-5">
                  <div className="flex items-start">
                    <CalendarIcon className="h-6 w-6 text-primary-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-neutral-900 mb-1">Season Schedule</p>
                      <p className="text-neutral-700">
                        {new Date(sportData.startDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })} - {new Date(sportData.endDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <ClockIcon className="h-6 w-6 text-primary-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-neutral-900 mb-1">Practice Times</p>
                      <p className="text-neutral-700">
                        {sportData.schedule.dayOfWeek.join(', ')}
                      </p>
                      <p className="text-neutral-700">
                        {sportData.schedule.startTime} - {sportData.schedule.endTime}
                      </p>
                    </div>
                  </div>

                  {sportData.schedule.location && (
                    <div className="flex items-start">
                      <MapPinIcon className="h-6 w-6 text-primary-600 mr-4 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-neutral-900 mb-1">Location</p>
                        <button
                          onClick={() => setShowMapModal(true)}
                          className="text-neutral-700 hover:text-primary-600 hover:underline text-left transition-colors"
                        >
                          {sportData.schedule.location}
                        </button>
                      </div>
                    </div>
                  )}

                  {sportData.coachName && (
                    <div className="flex items-start">
                      <UserIcon className="h-6 w-6 text-primary-600 mr-4 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-neutral-900 mb-1">Coach</p>
                        <p className="text-neutral-700">{sportData.coachName}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <UserGroupIcon className="h-6 w-6 text-primary-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-neutral-900 mb-1">Age Group</p>
                      <p className="text-neutral-700">{sportData.ageGroup}</p>
                    </div>
                  </div>

                  {sportData.skillLevel && (
                    <div className="flex items-start">
                      <AcademicCapIcon className="h-6 w-6 text-primary-600 mr-4 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-neutral-900 mb-1">Skill Level</p>
                        <p className="text-neutral-700 capitalize">{sportData.skillLevel}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* What to Expect Section */}
            <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-100">
              <CardContent>
                <div className="flex items-start mb-4">
                  <TrophyIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      What to Expect
                    </h3>
                    <ul className="space-y-2 text-neutral-700">
                      <li className="flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        Professional coaching and instruction
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        Age-appropriate skill development
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        Team building and sportsmanship
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        Regular practice sessions and games
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        End-of-season celebration
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Registration */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent>
                <div className="text-center mb-6 pb-6 border-b border-neutral-200">
                  <div className="flex items-center justify-center mb-2">
                    <CurrencyDollarIcon className="h-6 w-6 text-primary-600 mr-2" />
                    <p className="text-sm text-neutral-600">Program Fee</p>
                  </div>
                  <p className="text-4xl font-bold text-primary-600">
                    ${sportData.pricing}
                  </p>
                  <p className="text-sm text-neutral-600 mt-1">per participant</p>
                </div>

                {/* Enrollment Status */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">
                      Enrollment Status
                    </span>
                    <Badge 
                      variant={
                        isFull ? 'danger' : 
                        spotsRemaining < 5 ? 'warning' : 
                        'success'
                      }
                    >
                      {isFull ? 'Full' : `${spotsRemaining} spots left`}
                    </Badge>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isFull ? 'bg-red-500' :
                        spotsRemaining < 5 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-600 mt-2 text-center">
                    {sportData.enrolled} enrolled / {sportData.capacity} capacity
                  </p>
                </div>

                {/* Registration Button */}
                {!isMember && currentUser && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm text-yellow-800 font-medium mb-1">
                          Active membership required
                        </p>
                        <p className="text-xs text-yellow-700">
                          An annual membership is needed to enroll in sports programs or join the waitlist.{' '}
                          <Link to="/membership" className="underline hover:text-yellow-900 font-medium">
                            Purchase Membership
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {waitlistStatus ? (
                  <div className="w-full mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                    <div className="flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      <span className="font-medium">On Waitlist</span>
                    </div>
                  </div>
                ) : joinedWaitlist ? (
                  <div className="w-full mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center text-blue-700">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">Joined Waitlist!</span>
                  </div>
                ) : addedToCart ? (
                  <div className="w-full mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center text-green-700">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">
                      {sportData.pricing === 0 ? 'Enrolled Successfully!' : 'Added to Cart!'}
                    </span>
                  </div>
                ) : (
                  <>
                    {isFull && !sportData?.waitlistEnabled && (
                      <div className="mb-3">
                        <Alert type="info" message="This program is currently full." />
                      </div>
                    )}
                    
                    {!isFull && (
                      <Button
                        className="w-full mb-3"
                        onClick={handleAddToCart}
                        disabled={!isMember || enrolling}
                        isLoading={enrolling}
                      >
                        {!isMember ? 'Membership Required' : 'Add to Cart'}
                      </Button>
                    )}

                    {isFull && sportData?.waitlistEnabled && isMember && (
                      <Button
                        className="w-full mb-3"
                        onClick={handleJoinWaitlist}
                        disabled={joiningWaitlist}
                        variant="outline"
                      >
                        {joiningWaitlist ? 'Joining...' : 'Join Waitlist'}
                      </Button>
                    )}
                  </>
                )}

                {/* Only show View Cart button if the sport is not free */}
                {sportData.pricing > 0 && (
                  <Button
                    variant="outline"
                    className="w-full mb-4"
                    onClick={() => navigate('/cart')}
                  >
                    View Cart
                  </Button>
                )}

                {/* Program Info */}
                <div className="pt-6 border-t border-neutral-200 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Sport:</span>
                    <span className="font-medium text-neutral-900">{sportData.sportType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Season:</span>
                    <span className="font-medium text-neutral-900">{sportData.season}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Status:</span>
                    <Badge 
                      variant={
                        sportData.status === 'active' ? 'success' :
                        sportData.status === 'full' ? 'warning' :
                        'danger'
                      }
                    >
                      {sportData.status}
                    </Badge>
                  </div>
                </div>

                {/* Back Button */}
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/sports')}
                  >
                    ← Back to Sports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Location Map Modal */}
      {sportData.schedule.location && (
        <LocationMapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          location={sportData.schedule.location}
          title={sportData.title}
        />
      )}

      {/* Member Selection Modal */}
      {familyData && (
        <MemberSelectionModal
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          members={familyData.members}
          onConfirm={handleMemberSelection}
          title={sportData?.title || 'Sport'}
          itemType="sport"
        />
      )}

      {/* Waitlist Modal */}
      {familyData && (
        <MemberSelectionModal
          isOpen={showWaitlistModal}
          onClose={() => setShowWaitlistModal(false)}
          members={familyData.members}
          onConfirm={handleWaitlistConfirm}
          title={`${sportData?.title || 'Sport'} - Join Waitlist`}
          itemType="sport"
        />
      )}
    </div>
  );
};

