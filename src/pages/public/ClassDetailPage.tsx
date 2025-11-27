import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClassById } from '../../services/classes';
import { createEnrollment } from '../../services/enrollments';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Class } from '../../types';
import { Card, CardContent, Badge, Button, Spinner, Alert, LocationMapModal, MemberSelectionModal } from '../../components/ui';
import { CalendarIcon, MapPinIcon, UserIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { joinWaitlist, checkWaitlistStatus } from '../../services/waitlist';

export const ClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { currentUser, familyData } = useAuth();
  const { addToCart } = useCart();
  const [classData, setClassData] = useState<Class | null>(null);
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
    const fetchClass = async () => {
      if (!classId) return;
      
      try {
        const data = await getClassById(classId);
        setClassData(data);

        // Check if user is on waitlist
        if (familyData) {
          const status = await checkWaitlistStatus(classId, 'class', familyData.id);
          setWaitlistStatus(status);
        }
      } catch (err) {
        setError('Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [classId, familyData]);

  const handleAddToCart = () => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    if (!familyData || familyData.members.length === 0) {
      setError('Please add family members to your profile before enrolling in classes.');
      return;
    }

    setShowMemberModal(true);
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
    if (!classId || !familyData) return;

    setJoiningWaitlist(true);
    try {
      await joinWaitlist(classId, 'class', familyData.id, selectedMemberIds);
      const status = await checkWaitlistStatus(classId, 'class', familyData.id);
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

  const handleMemberSelection = async (selectedMemberIds: string[]) => {
    if (!classData || !classId || !familyData) return;

    // Check if the class is free (price is 0)
    const isFree = classData.pricing === 0;

    if (isFree) {
      // For free classes, enroll directly without going through cart/checkout
      setEnrolling(true);
      try {
        await createEnrollment({
          familyId: familyData.id,
          itemId: classId,
          itemType: 'class',
          memberIds: selectedMemberIds,
          status: 'active',
          orderId: `FREE-${Date.now()}-${crypto.randomUUID()}`, // Generate unique ID for free enrollment
        });

        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000);
      } catch (err) {
        console.error('Error enrolling in free class:', err);
        setError('Failed to enroll in class. Please try again.');
      } finally {
        setEnrolling(false);
      }
    } else {
      // For paid classes, add to cart as usual
      addToCart({
        itemId: classId,
        itemType: 'class',
        title: classData.title,
        price: classData.pricing,
        quantity: selectedMemberIds.length,
        memberIds: selectedMemberIds,
      });

      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
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

  if (error || !classData) {
    return (
      <div className="container-custom py-12">
        <Alert type="error" message={error || 'Class not found'} />
      </div>
    );
  }

  const spotsRemaining = classData.capacity - classData.enrolled;
  const isFull = spotsRemaining <= 0;
  const isMember = familyData?.membershipStatus === 'active';

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {classData.imageURL && (
              <img
                src={classData.imageURL}
                alt={classData.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            <h1 className="text-4xl font-bold text-neutral-900 mb-4">{classData.title}</h1>

            {classData.category && (
              <Badge variant="primary" className="mb-4">
                {classData.category}
              </Badge>
            )}

            <div className="prose max-w-none mb-8">
              <p className="text-neutral-700 text-lg leading-relaxed">{classData.description}</p>
            </div>

            <Card className="mb-6">
              <CardContent>
                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Class Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CalendarIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-neutral-900">Schedule</p>
                      <p className="text-neutral-600">
                        {classData.schedule.dayOfWeek.join(', ')}
                      </p>
                      <p className="text-neutral-600">
                        {classData.schedule.startTime} - {classData.schedule.endTime}
                      </p>
                      <p className="text-sm text-neutral-500 mt-1">
                        {new Date(classData.startDate).toLocaleDateString()} -{' '}
                        {new Date(classData.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {classData.schedule.location && (
                    <div className="flex items-start">
                      <MapPinIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-neutral-900">Location</p>
                        <button
                          onClick={() => setShowMapModal(true)}
                          className="text-neutral-600 hover:text-primary-600 hover:underline text-left transition-colors"
                        >
                          {classData.schedule.location}
                        </button>
                      </div>
                    </div>
                  )}

                  {classData.instructorName && (
                    <div className="flex items-start">
                      <UserIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-neutral-900">Instructor</p>
                        <p className="text-neutral-600">{classData.instructorName}</p>
                      </div>
                    </div>
                  )}

                  {(classData.ageRequirement || classData.gradeRequirement) && (
                    <div className="flex items-start">
                      <ClockIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-neutral-900">Requirements</p>
                        {classData.ageRequirement && (
                          <p className="text-neutral-600">Age: {classData.ageRequirement}</p>
                        )}
                        {classData.gradeRequirement && (
                          <p className="text-neutral-600">Grade: {classData.gradeRequirement}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {classData.prerequisites && classData.prerequisites.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <h3 className="font-semibold text-neutral-900 mb-2">Prerequisites</h3>
                    <ul className="list-disc list-inside text-neutral-600 space-y-1">
                      {classData.prerequisites.map((prereq, index) => (
                        <li key={index}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {classData.materials && (
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <h3 className="font-semibold text-neutral-900 mb-2">Materials Needed</h3>
                    <p className="text-neutral-600">{classData.materials}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent>
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-primary-600">${classData.pricing}</p>
                  <p className="text-neutral-600">per student</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-700">Spots Available</span>
                    <Badge variant={isFull ? 'danger' : spotsRemaining < 5 ? 'warning' : 'success'}>
                      {isFull ? 'Full' : `${spotsRemaining} left`}
                    </Badge>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(classData.enrolled / classData.capacity) * 100}%` }}
                    />
                  </div>
                </div>

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
                          An annual membership is needed to enroll in classes or join the waitlist.{' '}
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
                      {classData.pricing === 0 ? 'Enrolled Successfully!' : 'Added to Cart!'}
                    </span>
                  </div>
                ) : (
                  <>
                    {isFull && !classData?.waitlistEnabled && (
                      <div className="mb-3">
                        <Alert type="info" message="This class is currently full." />
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

                    {isFull && classData?.waitlistEnabled && isMember && (
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

                {/* Only show View Cart button if the class is not free */}
                {classData.pricing > 0 && (
                  <Button
                    variant="outline"
                    className="w-full mb-3"
                    onClick={() => navigate('/cart')}
                  >
                    View Cart
                  </Button>
                )}

                <div className="mt-6 pt-6 border-t border-neutral-200 text-sm text-neutral-600">
                  <p className="mb-2">
                    <strong>Total Sessions:</strong> Varies
                  </p>
                  <p>
                    <strong>Class Size:</strong> Max {classData.capacity} students
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Location Map Modal */}
      {classData.schedule.location && (
        <LocationMapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          location={classData.schedule.location}
          title={classData.title}
        />
      )}

      {/* Member Selection Modal */}
      {familyData && (
        <MemberSelectionModal
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          members={familyData.members}
          onConfirm={handleMemberSelection}
          title={classData?.title || 'Class'}
          itemType="class"
        />
      )}

      {familyData && (
        <MemberSelectionModal
          isOpen={showWaitlistModal}
          onClose={() => setShowWaitlistModal(false)}
          members={familyData.members}
          onConfirm={handleWaitlistConfirm}
          title={`${classData?.title || 'Class'} - Join Waitlist`}
          itemType="class"
        />
      )}
    </div>
  );
};

