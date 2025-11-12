import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassById } from '../../services/classes';
import { useAuth } from '../../contexts/AuthContext';
import { Class } from '../../types';
import { Card, CardContent, Badge, Button, Spinner, Alert } from '../../components/ui';
import { CalendarIcon, MapPinIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';

export const ClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClass = async () => {
      if (!classId) return;
      
      try {
        const data = await getClassById(classId);
        setClassData(data);
      } catch (err) {
        setError('Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [classId]);

  const handleAddToCart = () => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }
    // Add to cart logic will be implemented in cart context
    alert('Add to cart functionality coming soon!');
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
                        <p className="text-neutral-600">{classData.schedule.location}</p>
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

                <Button
                  className="w-full mb-3"
                  onClick={handleAddToCart}
                  disabled={isFull}
                >
                  {isFull ? 'Class Full' : 'Add to Cart'}
                </Button>

                {isFull && (
                  <Button className="w-full" variant="outline">
                    Join Waitlist
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
    </div>
  );
};

