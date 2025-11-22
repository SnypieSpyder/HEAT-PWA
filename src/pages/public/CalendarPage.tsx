import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { CalendarItem } from '../../types';
import { getCalendarItems } from '../../services/calendar';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarEventModal, Spinner } from '../../components/ui';

// Import CSS at the top level
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// No custom event component - let react-big-calendar handle rendering

export const CalendarPage: React.FC = () => {
  const { currentUser, familyData } = useAuth();
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchCalendarData();
  }, [currentUser, familyData]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const items = await getCalendarItems(familyData?.id);
      setCalendarItems(items);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform calendar items with color information
  const events = useMemo(() => {
    const transformed = calendarItems.map((item) => ({
      title: item.title,
      start: new Date(item.date),
      end: new Date(item.date),
      resource: {
        type: item.type,
        color: item.color,
        item: item,
      },
    }));
    
    console.log('Calendar events with colors:', transformed);
    return transformed;
  }, [calendarItems]);

  // Handle date selection
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setModalOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedDate(event.start);
    setModalOpen(true);
  };

  // Handle calendar navigation
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  // Get items for selected date
  const itemsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateStr = selectedDate.toDateString();
    return calendarItems.filter((item) => {
      return item.date.toDateString() === dateStr;
    });
  }, [selectedDate, calendarItems]);

  // Style events with their type-specific colors
  const eventStyleGetter = (event: any) => {
    const backgroundColor = event.resource?.color || '#3174ad';
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.85rem',
        padding: '2px 5px',
      },
    };
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center min-h-[500px]">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Calendar</h1>
          <p className="text-neutral-600">
            {currentUser
              ? 'View all events and your enrolled classes & sports'
              : 'View all upcoming events'}
          </p>
        </div>

        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-4 p-4 bg-neutral-50 rounded-lg">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-600 rounded-full mr-2"></span>
            <span className="text-sm text-neutral-700">Events</span>
          </div>
          {currentUser && (
            <>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                <span className="text-sm text-neutral-700">Classes (Enrolled)</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                <span className="text-sm text-neutral-700">Sports (Enrolled)</span>
              </div>
            </>
          )}
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div style={{ height: 600 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              date={currentDate}
              onNavigate={handleNavigate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              eventPropGetter={eventStyleGetter}
              popup
            />
          </div>
        </div>

        {/* Modal for date items */}
        {selectedDate && (
          <CalendarEventModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedDate(null);
            }}
            date={selectedDate}
            items={itemsForSelectedDate}
          />
        )}
      </div>

      {/* Minimal styling for better appearance */}
      <style>{`
        .rbc-calendar {
          font-family: inherit;
        }

        .rbc-header {
          padding: 12px 8px;
          font-weight: 600;
          border-bottom: 1px solid #e5e5e5;
          background-color: #fafafa;
        }

        .rbc-today {
          background-color: #fef3c7;
        }

        .rbc-off-range-bg {
          background-color: #f9fafb;
        }

        .rbc-event {
          cursor: pointer;
        }

        .rbc-event:hover {
          opacity: 1 !important;
        }

        .rbc-month-view {
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          overflow: hidden;
        }

        .rbc-toolbar {
          padding: 16px;
          margin-bottom: 16px;
          background-color: #f9fafb;
          border-radius: 8px;
        }

        .rbc-toolbar button {
          color: #404040;
          border: 1px solid #d4d4d4;
          background-color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
        }

        .rbc-toolbar button:hover {
          background-color: #f5f5f5;
          border-color: #a3a3a3;
        }

        .rbc-toolbar button.rbc-active {
          background-color: #dc2626;
          color: white;
          border-color: #dc2626;
        }

        .rbc-show-more {
          color: #2563eb;
          font-weight: 500;
          background-color: transparent;
          padding: 2px 5px;
          margin: 2px 0;
        }

        .rbc-show-more:hover {
          text-decoration: underline;
          background-color: transparent;
        }

        .rbc-date-cell {
          padding: 4px;
        }

        .rbc-date-cell.rbc-now {
          font-weight: 700;
          color: #dc2626;
        }

        .rbc-month-view .rbc-day-bg {
          min-height: 80px;
        }

        .rbc-overlay {
          background-color: white;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          padding: 8px;
        }

        .rbc-overlay-header {
          border-bottom: 1px solid #e5e5e5;
          padding-bottom: 8px;
          margin-bottom: 8px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

