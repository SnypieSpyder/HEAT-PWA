import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEnrollmentsByFamily } from '../../services/enrollments';
import { getWaitlistByFamily, removeFromWaitlist } from '../../services/waitlist';
import { getClassById } from '../../services/classes';
import { getSportById } from '../../services/sports';
import { getEventById } from '../../services/events';
import { Enrollment, WaitlistEntry, Class, Sport, Event } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Spinner, ConfirmModal } from '../../components/ui';
import {
  AcademicCapIcon,
  TrophyIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface EnrollmentWithDetails extends Enrollment {
  itemDetails?: Class | Sport | Event;
}

interface WaitlistEntryWithTitle extends WaitlistEntry {
  itemTitle?: string;
}

export const DashboardPage: React.FC = () => {
  const { userData, familyData, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntryWithTitle[]>([]);
  const [removingWaitlist, setRemovingWaitlist] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [entryToRemove, setEntryToRemove] = useState<WaitlistEntryWithTitle | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!familyData) {
        setLoading(false);
        return;
      }
      
      try {
        const [enrollmentsData, waitlistData] = await Promise.all([
          getEnrollmentsByFamily(familyData.id),
          getWaitlistByFamily(familyData.id)
        ]);
        
        const activeEnrollments = enrollmentsData.filter((e) => e.status === 'active');
        
        // Fetch details for each enrollment
        const enrollmentsWithDetails = await Promise.all(
          activeEnrollments.map(async (enrollment) => {
            let itemDetails;
            try {
              if (enrollment.itemType === 'class') {
                itemDetails = (await getClassById(enrollment.itemId)) || undefined;
              } else if (enrollment.itemType === 'sport') {
                itemDetails = (await getSportById(enrollment.itemId)) || undefined;
              } else if (enrollment.itemType === 'event') {
                itemDetails = (await getEventById(enrollment.itemId)) || undefined;
              }
            } catch (error) {
              console.error(`Error fetching details for ${enrollment.itemType} ${enrollment.itemId}:`, error);
            }
            return { ...enrollment, itemDetails };
          })
        );

        // Fetch titles for waitlist entries
        const waitlistWithTitles: WaitlistEntryWithTitle[] = await Promise.all(
          waitlistData.map(async (entry) => {
            let itemTitle = 'Unknown';
            try {
              if (entry.itemType === 'class') {
                const item = await getClassById(entry.itemId);
                itemTitle = item?.title || 'Unknown';
              } else if (entry.itemType === 'sport') {
                const item = await getSportById(entry.itemId);
                itemTitle = item?.title || 'Unknown';
              } else if (entry.itemType === 'event') {
                const item = await getEventById(entry.itemId);
                itemTitle = item?.title || 'Unknown';
              }
            } catch (error) {
              console.error(`Error fetching title for ${entry.itemType} ${entry.itemId}:`, error);
            }
            return { ...entry, itemTitle };
          })
        );
        
        setEnrollments(enrollmentsWithDetails);
        setWaitlistEntries(waitlistWithTitles);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [familyData]);

  const handleRemoveFromWaitlist = async () => {
    if (!entryToRemove) return;

    setRemovingWaitlist(entryToRemove.id);
    try {
      await removeFromWaitlist(entryToRemove.id);
      // Refresh waitlist entries
      if (familyData) {
        const updatedWaitlist = await getWaitlistByFamily(familyData.id);
        setWaitlistEntries(updatedWaitlist);
      }
      setConfirmModalOpen(false);
    } catch (error) {
      console.error('Error removing from waitlist:', error);
      alert('Failed to remove from waitlist. Please try again.');
    } finally {
      setRemovingWaitlist(null);
      setEntryToRemove(null);
    }
  };

  const handleRemoveClick = (entry: WaitlistEntry) => {
    setEntryToRemove(entry);
    setConfirmModalOpen(true);
  };

  if (authLoading) {
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
        <div className="flex flex-col justify-center items-center min-h-[50vh]">
          <Spinner size="lg" />
          <h2 className="text-2xl font-bold text-neutral-900 mt-6 mb-2">Setting up your account...</h2>
          <p className="text-neutral-600 text-center max-w-md">
            We're preparing your dashboard. This should only take a moment.
          </p>
        </div>
      </div>
    );
  }

  const membershipStatus = familyData.membershipStatus;
  const membershipExpiry = familyData.membershipExpiry
    ? new Date(familyData.membershipExpiry)
    : null;
  const isExpiringSoon =
    membershipExpiry && membershipExpiry.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;

  const activeClasses = enrollments.filter((e) => e.itemType === 'class');
  const activeSports = enrollments.filter((e) => e.itemType === 'sport');
  const upcomingEvents = enrollments.filter((e) => e.itemType === 'event');

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
            Welcome back, {familyData.familyName}!
          </h1>
          <p className="text-neutral-600">Here's an overview of your family's activities</p>
        </div>

        {/* Membership Status Alert */}
        {membershipStatus !== 'active' && (
          <Card className="mb-6 border-l-4 border-l-primary-600">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    Membership Required
                  </h3>
                  <p className="text-neutral-600">
                    Purchase an annual membership to access all programs and events
                  </p>
                </div>
                <Link to="/membership">
                  <Button>Purchase Membership</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {membershipStatus === 'active' && isExpiringSoon && (
          <Card className="mb-6 border-l-4 border-l-yellow-500">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    Membership Expiring Soon
                  </h3>
                  <p className="text-neutral-600">
                    Your membership expires on{' '}
                    {membershipExpiry?.toLocaleDateString()}
                  </p>
                </div>
                <Link to="/membership">
                  <Button variant="outline">Renew Now</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{activeClasses.length}</p>
              <p className="text-sm text-neutral-600">Active Classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <TrophyIcon className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{activeSports.length}</p>
              <p className="text-sm text-neutral-600">Sports Programs</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{upcomingEvents.length}</p>
              <p className="text-sm text-neutral-600">Upcoming Events</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">
                {familyData.members.length}
              </p>
              <p className="text-sm text-neutral-600">Family Members</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Classes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Classes</CardTitle>
                  <Link to="/classes">
                    <Button variant="ghost" size="sm">
                      Browse More
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : activeClasses.length === 0 ? (
                  <div className="text-center py-8 text-neutral-600">
                    <p>No active classes</p>
                    <Link to="/classes">
                      <Button variant="outline" size="sm" className="mt-3">
                        Browse Classes
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeClasses.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                          <div>
                            <p className="font-medium text-neutral-900">
                              {enrollment.itemDetails?.title || 'Class Enrolled'}
                            </p>
                            <p className="text-sm text-neutral-600">
                              {enrollment.memberIds.length} member(s)
                            </p>
                          </div>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Sports */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sports Programs</CardTitle>
                  <Link to="/sports">
                    <Button variant="ghost" size="sm">
                      Browse More
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : activeSports.length === 0 ? (
                  <div className="text-center py-8 text-neutral-600">
                    <p>No active sports programs</p>
                    <Link to="/sports">
                      <Button variant="outline" size="sm" className="mt-3">
                        Browse Sports
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeSports.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <TrophyIcon className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium text-neutral-900">
                              {enrollment.itemDetails?.title || 'Sport Enrolled'}
                            </p>
                            <p className="text-sm text-neutral-600">
                              {enrollment.memberIds.length} member(s)
                            </p>
                          </div>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Waitlist */}
            {waitlistEntries.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Waitlist</CardTitle>
                    <Link to="/enrollments">
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {waitlistEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-center flex-1">
                          <ClockIcon className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-900 truncate">
                              {entry.itemTitle}
                            </p>
                            <p className="text-sm text-neutral-600 capitalize">
                              {entry.itemType} • {entry.memberIds.length} member(s)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <Badge variant="info">Waiting</Badge>
                          <button
                            onClick={() => handleRemoveClick(entry)}
                            disabled={removingWaitlist === entry.id}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                            title="Remove from waitlist"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link to="/profile">
                    <Button variant="outline" className="w-full justify-start">
                      Manage Family Profile
                    </Button>
                  </Link>
                  <Link to="/classes">
                    <Button variant="outline" className="w-full justify-start">
                      Browse Classes
                    </Button>
                  </Link>
                  <Link to="/sports">
                    <Button variant="outline" className="w-full justify-start">
                      Browse Sports
                    </Button>
                  </Link>
                  <Link to="/calendar">
                    <Button variant="outline" className="w-full justify-start">
                      View Calendar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Membership Info */}
            <Card>
              <CardHeader>
                <CardTitle>Membership Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Status</span>
                    <Badge
                      variant={
                        membershipStatus === 'active'
                          ? 'success'
                          : membershipStatus === 'expired'
                          ? 'danger'
                          : 'neutral'
                      }
                    >
                      {membershipStatus}
                    </Badge>
                  </div>
                  {membershipExpiry && (
                    <div>
                      <p className="text-sm text-neutral-600">Expires</p>
                      <p className="font-medium text-neutral-900">
                        {membershipExpiry.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {membershipStatus === 'active' && (
                    <Link to="/membership">
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        Manage Membership
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setEntryToRemove(null);
        }}
        onConfirm={handleRemoveFromWaitlist}
        title="Remove from Waitlist"
        message={`Are you sure you want to remove yourself from the waitlist for "${entryToRemove?.itemTitle}"?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="warning"
        isLoading={removingWaitlist !== null}
      />
    </div>
  );
};

