import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { getOrdersByFamily } from '../../services/orders';
import { getEnrollmentsByFamily } from '../../services/enrollments';
import { Order, Enrollment } from '../../types';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Badge, 
  Spinner, 
  Alert 
} from '../../components/ui';
import {
  AcademicCapIcon,
  TrophyIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';

export const EnrollmentsPage: React.FC = () => {
  const { userData, familyData, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check for success parameter
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!familyData) {
        setLoading(false);
        return;
      }

      try {
        const [ordersData, enrollmentsData] = await Promise.all([
          getOrdersByFamily(familyData.id),
          getEnrollmentsByFamily(familyData.id),
        ]);
        setOrders(ordersData);
        setEnrollments(enrollmentsData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load enrollments');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [familyData]);

  if (authLoading || loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!userData || !familyData) {
    return (
      <div className="container-custom py-12">
        <Alert type="error" message="Please sign in to view your enrollments." />
      </div>
    );
  }

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'class':
        return <AcademicCapIcon className="h-5 w-5" />;
      case 'sport':
        return <TrophyIcon className="h-5 w-5" />;
      case 'event':
        return <CalendarIcon className="h-5 w-5" />;
      default:
        return <ReceiptPercentIcon className="h-5 w-5" />;
    }
  };

  const getMemberNames = (memberIds: string[]) => {
    if (!familyData) return '';
    return memberIds
      .map((id) => {
        const member = familyData.members.find((m) => m.id === id);
        return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
      })
      .join(', ');
  };

  // Group enrollments by type
  const activeEnrollments = enrollments.filter((e) => e.status === 'active');
  const classeEnrollments = activeEnrollments.filter((e) => e.itemType === 'class');
  const sportsEnrollments = activeEnrollments.filter((e) => e.itemType === 'sport');
  const eventEnrollments = activeEnrollments.filter((e) => e.itemType === 'event');

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Enrollments & Orders</h1>
        <p className="text-neutral-600 mb-8">
          View your purchase history and active enrollments
        </p>

        {showSuccess && (
          <div className="mb-6">
            <Alert 
              type="success" 
              message="Payment successful! Your enrollment has been confirmed."
              onClose={() => setShowSuccess(false)}
            />
          </div>
        )}

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        {/* Active Enrollments Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Active Classes</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {classeEnrollments.length}
                  </p>
                </div>
                <div className="p-3 bg-primary-100 rounded-full">
                  <AcademicCapIcon className="h-8 w-8 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Active Sports</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {sportsEnrollments.length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrophyIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Events Registered</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {eventEnrollments.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CalendarIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ReceiptPercentIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 mb-2">No orders yet</p>
                <p className="text-sm text-neutral-500">
                  Your purchase history will appear here after your first order.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-neutral-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </h3>
                          <Badge
                            variant={
                              order.paymentStatus === 'completed' ? 'success' :
                              order.paymentStatus === 'pending' ? 'warning' :
                              order.paymentStatus === 'failed' ? 'danger' :
                              'neutral'
                            }
                          >
                            {order.paymentStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-neutral-600">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-neutral-900">
                          ${order.total.toFixed(2)}
                        </p>
                        <div className="flex items-center text-sm text-neutral-600 mt-1">
                          <CreditCardIcon className="h-4 w-4 mr-1" />
                          {order.paymentMethod === 'stripe' ? 'Card' : 'PayPal'}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-3 bg-neutral-50 rounded-lg"
                        >
                          <div className="flex items-start flex-1">
                            <div className="p-2 bg-white rounded-lg mr-3">
                              {getItemIcon(item.itemType)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-neutral-900">{item.title}</p>
                              <p className="text-sm text-neutral-600 capitalize">
                                {item.itemType}
                              </p>
                              {item.memberIds && item.memberIds.length > 0 && (
                                <p className="text-xs text-neutral-500 mt-1">
                                  For: {getMemberNames(item.memberIds)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-neutral-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-xs text-neutral-600">
                              ${item.price} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <div className="flex justify-between text-sm text-neutral-600 mb-1">
                        <span>Subtotal</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-neutral-600 mb-2">
                        <span>Processing Fee</span>
                        <span>${(order.total - order.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold text-neutral-900">
                        <span>Total</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Enrollments Details */}
        {activeEnrollments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-start justify-between p-4 border border-neutral-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start flex-1">
                      <div className="p-2 bg-primary-100 rounded-lg mr-3">
                        {getItemIcon(enrollment.itemType)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900 capitalize">
                          {enrollment.itemType}
                        </p>
                        {enrollment.memberIds && enrollment.memberIds.length > 0 && (
                          <p className="text-sm text-neutral-600 mt-1">
                            Members: {getMemberNames(enrollment.memberIds)}
                          </p>
                        )}
                        <p className="text-xs text-neutral-500 mt-1">
                          Enrolled on{' '}
                          {new Date(enrollment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        {enrollment.itemType === 'membership' && familyData?.membershipExpiry && (
                          <p className="text-xs text-neutral-700 font-medium mt-1">
                            Active until{' '}
                            {new Date(familyData.membershipExpiry).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <Badge variant="success">{enrollment.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

