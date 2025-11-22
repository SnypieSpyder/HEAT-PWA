import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '../../hooks/useFirestore';
import { useOrganization } from '../../contexts/OrganizationContext';
import { Event } from '../../types';
import { Card, Badge, Button, Spinner } from '../../components/ui';
import { CalendarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

export const EventsPage: React.FC = () => {
  const { organization } = useOrganization();
  const { data: rawEvents, loading } = useCollection<Event>('events');

  // Convert Firestore Timestamps to Date objects and filter by organization
  const events = useMemo(() => {
    const convertedEvents = rawEvents.map(event => ({
      ...event,
      date: event.date instanceof Date ? event.date : (event.date as any)?.toDate?.() || new Date(event.date),
      createdAt: event.createdAt instanceof Date ? event.createdAt : (event.createdAt as any)?.toDate?.() || new Date(),
      updatedAt: event.updatedAt instanceof Date ? event.updatedAt : (event.updatedAt as any)?.toDate?.() || new Date(),
    }));
    
    // Filter by organization (including events without organizationId for backward compatibility)
    return convertedEvents.filter(event => 
      !event.organizationId || event.organizationId === organization.id
    );
  }, [rawEvents, organization.id]);

  // Filter to show only upcoming and ongoing events based on status field
  const upcomingEvents = useMemo(() => {
    return events
      .filter((event) => event.status === 'upcoming' || event.status === 'ongoing')
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events]);

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Events</h1>
          <p className="text-xl text-neutral-600">
            Join us for exciting community events and activities
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && upcomingEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">
              No upcoming events at this time. Check back soon!
            </p>
          </div>
        )}

        {!loading && upcomingEvents.length > 0 && (
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} hover>
                <div className="flex flex-col md:flex-row">
                  {event.imageURL && (
                    <img
                      src={event.imageURL}
                      alt={event.title}
                      className="w-full md:w-64 h-48 object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                    />
                  )}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-semibold text-neutral-900">{event.title}</h3>
                      <Badge
                        variant={
                          event.status === 'upcoming'
                            ? 'success'
                            : event.status === 'completed'
                            ? 'neutral'
                            : 'warning'
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>

                    <p className="text-neutral-700 mb-4">{event.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-neutral-600">
                        <CalendarIcon className="h-5 w-5 mr-2 text-primary-600" />
                        <span className="text-sm">
                          {event.date.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-neutral-600">
                        <ClockIcon className="h-5 w-5 mr-2 text-primary-600" />
                        <span className="text-sm">
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                      <div className="flex items-center text-neutral-600">
                        <MapPinIcon className="h-5 w-5 mr-2 text-primary-600" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {event.ticketTypes && event.ticketTypes.length > 0 && (
                          <p className="text-sm text-neutral-600">
                            From ${Math.min(...event.ticketTypes.map((t) => t.price))}
                          </p>
                        )}
                      </div>
                      <Link to={`/events/${event.id}`}>
                        <Button>View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

