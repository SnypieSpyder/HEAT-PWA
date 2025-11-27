import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';
import { ImageUpload } from '../common/ImageUpload';
import { Event, TicketType, VolunteerSlot } from '../../../types';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Event>) => Promise<void>;
  initialData?: Event;
  initialVolunteerSlots?: VolunteerSlot[];
  title: string;
}

export const EventForm: React.FC<EventFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialVolunteerSlots = [],
  title,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [volunteerSlots, setVolunteerSlots] = useState<VolunteerSlot[]>([]);
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
    volunteerEnabled: false,
    volunteerRequired: false,
    volunteerListInTab: false,
  });

  useEffect(() => {
    if (isOpen) {
      setError(''); // Reset error when modal opens
      if (initialData) {
        setFormData(initialData);
        // Load volunteer slots from initialVolunteerSlots when editing
        setVolunteerSlots(initialVolunteerSlots || []);
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
          volunteerEnabled: false,
          volunteerRequired: false,
          volunteerListInTab: false,
        });
        setVolunteerSlots([]);
      }
    }
  }, [initialData, initialVolunteerSlots, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate volunteer settings
    if (formData.volunteerEnabled && volunteerSlots.length === 0) {
      setError('Please add at least one volunteer slot or disable volunteer opportunities.');
      return;
    }
    
    // Validate volunteer slots have required fields
    if (formData.volunteerEnabled && volunteerSlots.length > 0) {
      const invalidSlots = volunteerSlots.filter(slot => !slot.name || !slot.when || slot.capacity <= 0);
      if (invalidSlots.length > 0) {
        setError('Please fill in all volunteer slot fields (name, when, and capacity must be greater than 0).');
        return;
      }
    }
    
    setLoading(true);
    try {
      // Remove undefined, null, and empty string values before submitting to Firestore
      const cleanedData: any = {
        title: formData.title || '',
        description: formData.description || '',
        date: formData.date || new Date(),
        startTime: formData.startTime || '',
        endTime: formData.endTime || '',
        location: formData.location || '',
        status: formData.status || 'upcoming',
      };
      
      // Add optional fields only if they have valid values
      if (formData.capacity && formData.capacity > 0) {
        cleanedData.capacity = formData.capacity;
      }
      
      if (formData.ticketTypes && formData.ticketTypes.length > 0) {
        cleanedData.ticketTypes = formData.ticketTypes;
      }
      
      if (formData.imageURL) {
        cleanedData.imageURL = formData.imageURL;
      }
      
      if (formData.flyerURL) {
        cleanedData.flyerURL = formData.flyerURL;
      }
      
      // Boolean fields - always include with explicit values
      cleanedData.allowNonMembers = formData.allowNonMembers ?? true;
      cleanedData.waitlistEnabled = formData.waitlistEnabled ?? false;
      cleanedData.volunteerEnabled = formData.volunteerEnabled ?? false;
      cleanedData.volunteerRequired = formData.volunteerRequired ?? false;
      cleanedData.volunteerListInTab = formData.volunteerListInTab ?? false;
      
      // Add volunteer slots to the data if volunteers are enabled
      if (formData.volunteerEnabled && volunteerSlots.length > 0) {
        cleanedData.volunteerSlots = volunteerSlots;
      }
      
      console.log('Submitting cleaned data:', cleanedData);
      await onSubmit(cleanedData);
      onClose();
      setError('');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError(error.message || 'Failed to submit event. Please check all fields and try again.');
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

  const addVolunteerSlot = () => {
    const newSlot: VolunteerSlot = {
      id: crypto.randomUUID(),
      name: '',
      when: '',
      capacity: 0,
      signups: [],
    };
    setVolunteerSlots([...volunteerSlots, newSlot]);
  };

  const removeVolunteerSlot = (id: string) => {
    setVolunteerSlots(volunteerSlots.filter((s) => s.id !== id));
  };

  const updateVolunteerSlot = (id: string, field: keyof VolunteerSlot, value: any) => {
    setVolunteerSlots(
      volunteerSlots.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')}
          />
        )}
        
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

        {/* Enable Volunteer Opportunities Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="volunteerEnabled"
            checked={formData.volunteerEnabled || false}
            onChange={(e) => {
              setFormData({ ...formData, volunteerEnabled: e.target.checked });
              if (!e.target.checked) {
                setFormData({ ...formData, volunteerEnabled: false, volunteerListInTab: false });
                setVolunteerSlots([]);
              }
            }}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
          />
          <label htmlFor="volunteerEnabled" className="ml-2 block text-sm text-neutral-700">
            Enable volunteer opportunities
            <span className="block text-xs text-neutral-500">Allow participants to sign up as volunteers</span>
          </label>
        </div>

        {/* Require Volunteering Checkbox - Only show if volunteers enabled */}
        {formData.volunteerEnabled && (
          <div className="flex items-center ml-6">
            <input
              type="checkbox"
              id="volunteerRequired"
              checked={formData.volunteerRequired || false}
              onChange={(e) => setFormData({ ...formData, volunteerRequired: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label htmlFor="volunteerRequired" className="ml-2 block text-sm text-neutral-700">
              Require volunteering for participants
              <span className="block text-xs text-neutral-500">Force all event participants to sign up for a volunteer slot</span>
            </label>
          </div>
        )}

        {/* List in Volunteer Tab Checkbox - Only show if volunteers enabled */}
        {formData.volunteerEnabled && (
          <div className="flex items-center ml-6">
            <input
              type="checkbox"
              id="volunteerListInTab"
              checked={formData.volunteerListInTab || false}
              onChange={(e) => setFormData({ ...formData, volunteerListInTab: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label htmlFor="volunteerListInTab" className="ml-2 block text-sm text-neutral-700">
              List in volunteer tab for non-participants
              <span className="block text-xs text-neutral-500">Show this opportunity to everyone, not just event participants</span>
            </label>
          </div>
        )}

        {/* Volunteer Slots Section - Only show if volunteers enabled */}
        {formData.volunteerEnabled && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-neutral-700">Volunteer Slots</label>
              <Button type="button" variant="outline" size="sm" onClick={addVolunteerSlot}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Slot
              </Button>
            </div>

            {volunteerSlots.length > 0 ? (
              <div className="space-y-3">
                {volunteerSlots.map((slot) => (
                  <div key={slot.id} className="p-3 border border-neutral-200 rounded-md space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Slot name (e.g., Help Set Up)"
                        value={slot.name}
                        onChange={(e) => updateVolunteerSlot(slot.id, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="When (e.g., 20 min prior)"
                        value={slot.when}
                        onChange={(e) => updateVolunteerSlot(slot.id, 'when', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Capacity"
                        type="number"
                        min="0"
                        value={slot.capacity !== undefined && slot.capacity !== null && !isNaN(slot.capacity) ? slot.capacity : ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            updateVolunteerSlot(slot.id, 'capacity', 0);
                          } else {
                            const num = parseInt(value, 10);
                            updateVolunteerSlot(slot.id, 'capacity', isNaN(num) ? 0 : num);
                          }
                        }}
                        className="w-24"
                      />
                      <button
                        type="button"
                        onClick={() => removeVolunteerSlot(slot.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 py-4 text-center border border-dashed border-neutral-300 rounded-md">
                No volunteer slots added yet
              </p>
            )}
          </div>
        )}

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

