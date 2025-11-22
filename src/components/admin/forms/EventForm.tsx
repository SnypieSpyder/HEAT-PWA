import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { ImageUpload } from '../common/ImageUpload';
import { Event, TicketType } from '../../../types';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Event>) => Promise<void>;
  initialData?: Event;
  title: string;
}

export const EventForm: React.FC<EventFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    location: '',
    ticketTypes: [],
    capacity: undefined,
    imageURL: '',
    flyerURL: '',
    status: 'upcoming',
    allowNonMembers: true,
    waitlistEnabled: false,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        // Reset form for new events
        setFormData({
          title: '',
          description: '',
          date: new Date(),
          startTime: '',
          endTime: '',
          location: '',
          ticketTypes: [],
          capacity: undefined,
          imageURL: '',
          flyerURL: '',
          status: 'upcoming',
          allowNonMembers: true,
          waitlistEnabled: false,
        });
      }
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Remove undefined values before submitting to Firestore
      const cleanedData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== undefined)
      );
      await onSubmit(cleanedData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTicketType = () => {
    const newTicket: TicketType = {
      id: crypto.randomUUID(),
      name: '',
      price: undefined as any,
      available: undefined as any,
    };
    setFormData({
      ...formData,
      ticketTypes: [...(formData.ticketTypes || []), newTicket],
    });
  };

  const removeTicketType = (id: string) => {
    setFormData({
      ...formData,
      ticketTypes: formData.ticketTypes?.filter((t) => t.id !== id),
    });
  };

  const updateTicketType = (id: string, field: keyof TicketType, value: any) => {
    setFormData({
      ...formData,
      ticketTypes: formData.ticketTypes?.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Event Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Event Date"
            type="date"
            required
            value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
          />
          <Input
            label="Start Time"
            type="time"
            required
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
          <Input
            label="End Time"
            type="time"
            required
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          />
        </div>

        <Input
          label="Location"
          required
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />

        <Input
          label="Total Capacity (optional)"
          type="number"
          value={formData.capacity || ''}
          onChange={(e) =>
            setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : undefined })
          }
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-neutral-700">Ticket Types</label>
            <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Ticket Type
            </Button>
          </div>

          {formData.ticketTypes && formData.ticketTypes.length > 0 ? (
            <div className="space-y-3">
              {formData.ticketTypes.map((ticket) => (
                <div key={ticket.id} className="flex gap-2 p-3 border border-neutral-200 rounded-md">
                  <Input
                    placeholder="Ticket name"
                    value={ticket.name}
                    onChange={(e) => updateTicketType(ticket.id, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    value={ticket.price?.toString() || ''}
                    onChange={(e) => updateTicketType(ticket.id, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-24"
                  />
                  <Input
                    placeholder="Available"
                    type="number"
                    value={ticket.available?.toString() || ''}
                    onChange={(e) => updateTicketType(ticket.id, 'available', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-24"
                  />
                  <button
                    type="button"
                    onClick={() => removeTicketType(ticket.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 py-4 text-center border border-dashed border-neutral-300 rounded-md">
              No ticket types added yet
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
          <select
            required
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Enable Waitlist Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="waitlistEnabled"
            checked={formData.waitlistEnabled || false}
            onChange={(e) => setFormData({ ...formData, waitlistEnabled: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
          />
          <label htmlFor="waitlistEnabled" className="ml-2 block text-sm text-neutral-700">
            Enable Waitlist
            <span className="block text-xs text-neutral-500">Allow members to join waitlist when event is full</span>
          </label>
        </div>

        {/* Allow Non-Members Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowNonMembers"
            checked={formData.allowNonMembers !== false}
            onChange={(e) => setFormData({ ...formData, allowNonMembers: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
          />
          <label htmlFor="allowNonMembers" className="ml-2 block text-sm text-neutral-700">
            Allow non-members to purchase tickets
          </label>
        </div>

        <ImageUpload
          key={`event-image-${initialData?.id || 'new'}`}
          label="Event Image"
          value={formData.imageURL}
          onChange={(url) => setFormData({ ...formData, imageURL: url })}
          folder="events"
        />

        <ImageUpload
          key={`event-flyer-${initialData?.id || 'new'}`}
          label="Event Flyer (optional)"
          value={formData.flyerURL}
          onChange={(url) => setFormData({ ...formData, flyerURL: url })}
          folder="events/flyers"
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {initialData ? 'Update' : 'Create'} Event
          </Button>
        </div>
      </form>
    </Modal>
  );
};

