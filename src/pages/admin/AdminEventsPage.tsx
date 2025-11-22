import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/admin/common/DataTable';
import { StatusBadge } from '../../components/admin/common/StatusBadge';
import { EventForm } from '../../components/admin/forms/EventForm';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Event } from '../../types';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../services/events';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; eventId: string | null }>({
    show: false,
    eventId: null,
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setAlert({ type: 'error', message: 'Failed to load events' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<Event>) => {
    try {
      await createEvent(data as Omit<Event, 'id' | 'createdAt' | 'updatedAt'>);
      setAlert({ type: 'success', message: 'Event created successfully' });
      fetchEvents();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
      setAlert({ type: 'error', message: 'Failed to create event' });
      throw error;
    }
  };

  const handleUpdate = async (data: Partial<Event>) => {
    if (!editingEvent) return;
    try {
      await updateEvent(editingEvent.id, data);
      setAlert({ type: 'success', message: 'Event updated successfully' });
      fetchEvents();
      setShowForm(false);
      setEditingEvent(undefined);
    } catch (error) {
      console.error('Error updating event:', error);
      setAlert({ type: 'error', message: 'Failed to update event' });
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.eventId) return;
    try {
      await deleteEvent(deleteConfirm.eventId);
      setAlert({ type: 'success', message: 'Event deleted successfully' });
      fetchEvents();
      setDeleteConfirm({ show: false, eventId: null });
    } catch (error) {
      console.error('Error deleting event:', error);
      setAlert({ type: 'error', message: 'Failed to delete event' });
    }
  };

  const openEditForm = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const openCreateForm = () => {
    setEditingEvent(undefined);
    setShowForm(true);
  };

  const columns: Column<Event>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (item) => (
        <div className="text-xs">
          <div>{item.date.toLocaleDateString()}</div>
          <div className="text-neutral-500">
            {item.startTime} - {item.endTime}
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
    },
    {
      key: 'capacity',
      header: 'Registered',
      render: (item) => (
        <span>
          {item.registered}{item.capacity ? ` / ${item.capacity}` : ''}
        </span>
      ),
    },
    {
      key: 'ticketTypes',
      header: 'Ticket Types',
      render: (item) => <span>{item.ticketTypes.length} type(s)</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} type="event" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openEditForm(item)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteConfirm({ show: true, eventId: item.id })}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container-custom py-8">
      <div className="max-w-7xl mx-auto">
        {alert && (
          <div className="mb-4">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Events Management</h1>
            <p className="text-neutral-600 mt-1">Create and manage community events</p>
          </div>
          <Button onClick={openCreateForm}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Event
          </Button>
        </div>

        <DataTable
          data={events}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search events..."
          emptyMessage="No events found. Create your first event to get started."
        />

        <EventForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingEvent(undefined);
          }}
          onSubmit={editingEvent ? handleUpdate : handleCreate}
          initialData={editingEvent}
          title={editingEvent ? 'Edit Event' : 'Create New Event'}
        />

        <ConfirmModal
          isOpen={deleteConfirm.show}
          onClose={() => setDeleteConfirm({ show: false, eventId: null })}
          onConfirm={handleDelete}
          title="Delete Event"
          message="Are you sure you want to delete this event? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
};

