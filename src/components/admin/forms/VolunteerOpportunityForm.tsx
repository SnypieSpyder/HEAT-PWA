import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { VolunteerOpportunity, VolunteerSlot } from '../../../types';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface VolunteerOpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<VolunteerOpportunity>) => Promise<void>;
  initialData?: VolunteerOpportunity;
  title: string;
}

export const VolunteerOpportunityForm: React.FC<VolunteerOpportunityFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<VolunteerOpportunity>>({
    title: '',
    description: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    location: '',
    slots: [],
    status: 'active',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Remove undefined values before submitting to Firestore
      const cleanedData = {
        ...formData,
        slots: formData.slots?.map(slot => ({
          ...slot,
          capacity: slot.capacity || 0, // Default to 0 if undefined
        })),
      };
      await onSubmit(cleanedData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = () => {
    const newSlot: VolunteerSlot = {
      id: crypto.randomUUID(),
      name: '',
      when: '',
      capacity: 0,
      signups: [],
    };
    setFormData({
      ...formData,
      slots: [...(formData.slots || []), newSlot],
    });
  };

  const removeSlot = (id: string) => {
    setFormData({
      ...formData,
      slots: formData.slots?.filter((s) => s.id !== id),
    });
  };

  const updateSlot = (id: string, field: keyof VolunteerSlot, value: any) => {
    setFormData({
      ...formData,
      slots: formData.slots?.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Opportunity Title"
          required
          placeholder="e.g., Elementary Mine Craft Event Volunteers"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Describe what volunteers will be doing..."
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-neutral-700">Volunteer Slots</label>
            <Button type="button" variant="outline" size="sm" onClick={addSlot}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Slot
            </Button>
          </div>

          {formData.slots && formData.slots.length > 0 ? (
            <div className="space-y-3">
              {formData.slots.map((slot) => (
                <div key={slot.id} className="p-3 border border-neutral-200 rounded-md space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Slot name (e.g., Help Set Up)"
                      value={slot.name}
                      onChange={(e) => updateSlot(slot.id, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="When (e.g., 20 min prior)"
                      value={slot.when}
                      onChange={(e) => updateSlot(slot.id, 'when', e.target.value)}
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
                          updateSlot(slot.id, 'capacity', 0);
                        } else {
                          const num = parseInt(value, 10);
                          updateSlot(slot.id, 'capacity', isNaN(num) ? 0 : num);
                        }
                      }}
                      className="w-24"
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(slot.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {slot.signups.length > 0 && (
                    <p className="text-xs text-neutral-500 pl-2">
                      {slot.signups.length} volunteer(s) signed up
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 py-4 text-center border border-dashed border-neutral-300 rounded-md">
              No slots added yet
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
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {initialData ? 'Update' : 'Create'} Opportunity
          </Button>
        </div>
      </form>
    </Modal>
  );
};

