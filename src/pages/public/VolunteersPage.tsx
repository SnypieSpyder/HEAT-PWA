import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { EventVolunteerModal } from '../../components/ui/EventVolunteerModal';
import { VolunteerOpportunity } from '../../types';
import { getPublicVolunteerOpportunities } from '../../services/volunteers';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';

export const VolunteersPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      // Use getPublicVolunteerOpportunities to filter based on listInTab
      const data = await getPublicVolunteerOpportunities();
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setAlert({ type: 'error', message: 'Failed to load volunteer opportunities' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOpportunity = (opportunity: VolunteerOpportunity) => {
    setSelectedOpportunity(opportunity);
    setShowVolunteerModal(true);
  };

  const handleVolunteerSignupSuccess = async () => {
    // Refresh the opportunities list
    try {
      const data = await getPublicVolunteerOpportunities();
      setOpportunities(data);
      
      // Update the selected opportunity with the fresh data
      if (selectedOpportunity) {
        const updatedOpportunity = data.find(o => o.id === selectedOpportunity.id);
        if (updatedOpportunity) {
          setSelectedOpportunity(updatedOpportunity);
        }
      }
    } catch (error) {
      console.error('Error refreshing opportunities:', error);
    }
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
                  <div className="flex items-start gap-3 mb-2">
                    <CardTitle className="text-2xl flex-1">{opportunity.title}</CardTitle>
                    {opportunity.eventId && (
                      <Badge variant="info" className="flex items-center gap-1 flex-shrink-0">
                        <TicketIcon className="h-3 w-3" />
                        Event Volunteer
                      </Badge>
                    )}
                  </div>
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
                  <div className="text-center">
                    <p className="text-neutral-600 mb-4">
                      {opportunity.slots.length} volunteer slot{opportunity.slots.length !== 1 ? 's' : ''} available
                    </p>
                    <Button onClick={() => handleViewOpportunity(opportunity)}>
                      View Slots & Sign Up
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Volunteer Signup Modal */}
        <EventVolunteerModal
          isOpen={showVolunteerModal}
          onClose={() => {
            setShowVolunteerModal(false);
            setSelectedOpportunity(null);
          }}
          opportunity={selectedOpportunity}
          onSignupSuccess={handleVolunteerSignupSuccess}
        />
      </div>
    </div>
  );
};

