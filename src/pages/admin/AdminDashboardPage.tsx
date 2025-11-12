import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Card, CardHeader, CardTitle, CardContent, Spinner } from '../../components/ui';
import {
  UserGroupIcon,
  AcademicCapIcon,
  TrophyIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalFamilies: number;
  totalClasses: number;
  totalSports: number;
  totalEvents: number;
  totalEnrollments: number;
  activeMembers: number;
}

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalFamilies: 0,
    totalClasses: 0,
    totalSports: 0,
    totalEvents: 0,
    totalEnrollments: 0,
    activeMembers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [familiesSnap, classesSnap, sportsSnap, eventsSnap, enrollmentsSnap] =
          await Promise.all([
            getDocs(collection(db, 'families')),
            getDocs(query(collection(db, 'classes'), where('status', '==', 'active'))),
            getDocs(query(collection(db, 'sports'), where('status', '==', 'active'))),
            getDocs(collection(db, 'events')),
            getDocs(query(collection(db, 'enrollments'), where('status', '==', 'active'))),
          ]);

        const activeMembershipsSnap = await getDocs(
          query(collection(db, 'families'), where('membershipStatus', '==', 'active'))
        );

        setStats({
          totalFamilies: familiesSnap.size,
          totalClasses: classesSnap.size,
          totalSports: sportsSnap.size,
          totalEvents: eventsSnap.size,
          totalEnrollments: enrollmentsSnap.size,
          activeMembers: activeMembershipsSnap.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickLinks = [
    {
      title: 'Manage Classes',
      description: 'Add, edit, or remove classes',
      icon: AcademicCapIcon,
      link: '/admin/classes',
      color: 'blue',
    },
    {
      title: 'Manage Sports',
      description: 'Manage sports programs',
      icon: TrophyIcon,
      link: '/admin/sports',
      color: 'green',
    },
    {
      title: 'Manage Events',
      description: 'Create and manage events',
      icon: CalendarIcon,
      link: '/admin/events',
      color: 'purple',
    },
    {
      title: 'Manage Instructors',
      description: 'Add and edit instructors',
      icon: UserGroupIcon,
      link: '/admin/instructors',
      color: 'orange',
    },
    {
      title: 'View Families',
      description: 'View registered families',
      icon: UserGroupIcon,
      link: '/admin/families',
      color: 'indigo',
    },
    {
      title: 'Contact Submissions',
      description: 'View contact form submissions',
      icon: DocumentTextIcon,
      link: '/admin/contacts',
      color: 'pink',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    pink: 'bg-pink-100 text-pink-600',
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-neutral-600">Manage Tampa Bay HEAT content and users</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
              <Card>
                <CardContent className="text-center">
                  <UserGroupIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalFamilies}</p>
                  <p className="text-sm text-neutral-600">Total Families</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="text-center">
                  <AcademicCapIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalClasses}</p>
                  <p className="text-sm text-neutral-600">Active Classes</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="text-center">
                  <TrophyIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalSports}</p>
                  <p className="text-sm text-neutral-600">Sports Programs</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="text-center">
                  <CalendarIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalEvents}</p>
                  <p className="text-sm text-neutral-600">Events</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="text-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-900">
                    {stats.totalEnrollments}
                  </p>
                  <p className="text-sm text-neutral-600">Enrollments</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="text-center">
                  <UserGroupIcon className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-900">{stats.activeMembers}</p>
                  <p className="text-sm text-neutral-600">Active Members</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quickLinks.map((link) => (
                    <Link key={link.title} to={link.link}>
                      <div className="p-6 border-2 border-neutral-200 rounded-lg hover:border-primary-600 hover:shadow-md transition-all cursor-pointer">
                        <div
                          className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                            colorClasses[link.color as keyof typeof colorClasses]
                          }`}
                        >
                          <link.icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-neutral-900 mb-1">{link.title}</h3>
                        <p className="text-sm text-neutral-600">{link.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

