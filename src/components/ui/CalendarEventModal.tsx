import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { Button } from './Button';
import { CalendarItem } from '../../types';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  items: CalendarItem[];
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  date,
  items,
}) => {
  const navigate = useNavigate();

  const handleItemClick = (item: CalendarItem) => {
    const baseId = item.id.split('-')[0]; // Remove date suffix for recurring items
    switch (item.type) {
      case 'event':
        navigate(`/events/${baseId}`);
        break;
      case 'class':
        navigate(`/classes/${baseId}`);
        break;
      case 'sport':
        navigate(`/sports/${baseId}`);
        break;
    }
    onClose();
  };

  // Group items by type
  const events = items.filter((item) => item.type === 'event');
  const classes = items.filter((item) => item.type === 'class');
  const sports = items.filter((item) => item.type === 'sport');

  const getTypeBadgeColor = (type: 'event' | 'class' | 'sport') => {
    switch (type) {
      case 'event':
        return 'danger';
      case 'class':
        return 'info';
      case 'sport':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
      size="lg"
    >
      <div className="space-y-6">
        {items.length === 0 ? (
          <p className="text-center text-neutral-500 py-8">
            No scheduled items for this date.
          </p>
        ) : (
          <>
            {/* Events Section */}
            {events.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                  Events
                </h3>
                <div className="space-y-2">
                  {events.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="p-4 border border-neutral-200 rounded-lg hover:border-red-300 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-neutral-900">{item.title}</h4>
                        <Badge variant={getTypeBadgeColor(item.type)}>
                          Event
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-neutral-600">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {item.startTime} - {item.endTime}
                        </div>
                        {item.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            {item.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Classes Section */}
            {classes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                  Classes
                </h3>
                <div className="space-y-2">
                  {classes.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="p-4 border border-neutral-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-neutral-900">{item.title}</h4>
                        <div className="flex gap-2">
                          {item.isEnrolled && (
                            <Badge variant="success">Enrolled</Badge>
                          )}
                          <Badge variant={getTypeBadgeColor(item.type)}>
                            Class
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-neutral-600">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {item.startTime} - {item.endTime}
                        </div>
                        {item.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            {item.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sports Section */}
            {sports.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                  Sports
                </h3>
                <div className="space-y-2">
                  {sports.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="p-4 border border-neutral-200 rounded-lg hover:border-green-300 hover:bg-green-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-neutral-900">{item.title}</h4>
                        <div className="flex gap-2">
                          {item.isEnrolled && (
                            <Badge variant="success">Enrolled</Badge>
                          )}
                          <Badge variant={getTypeBadgeColor(item.type)}>
                            Sport
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-neutral-600">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {item.startTime} - {item.endTime}
                        </div>
                        {item.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            {item.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end pt-4 border-t border-neutral-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

