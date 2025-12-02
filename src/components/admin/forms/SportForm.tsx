import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { ImageUpload } from '../common/ImageUpload';
import { Sport, Instructor } from '../../../types';
import { getInstructors } from '../../../services/instructors';

interface SportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Sport>) => Promise<void>;
  initialData?: Sport;
  title: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SportForm: React.FC<SportFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [formData, setFormData] = useState<Partial<Sport>>({
    title: '',
    description: '',
    sportType: '',
    season: '',
    coachId: '',
    coachName: '',
    schedule: {
      dayOfWeek: [],
      startTime: '',
      endTime: '',
      location: '',
    },
    capacity: undefined,
    pricing: undefined,
    ageGroup: '',
    skillLevel: 'all',
    imageURL: '',
    startDate: new Date(),
    endDate: new Date(),
    status: 'active',
    waitlistEnabled: false,
    allowParents: false,
  });

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const data = await getInstructors();
        setInstructors(data);
      } catch (error) {
        console.error('Error fetching instructors:', error);
      }
    };
    fetchInstructors();
  }, []);

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

  const handleCoachChange = (coachId: string) => {
    const coach = instructors.find(i => i.id === coachId);
    setFormData({
      ...formData,
      coachId,
      coachName: coach ? `${coach.firstName} ${coach.lastName}` : '',
    });
  };

  const toggleDay = (day: string) => {
    const currentDays = formData.schedule?.dayOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    setFormData({
      ...formData,
      schedule: { ...formData.schedule!, dayOfWeek: newDays },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Sport Title"
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

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Sport Type"
            required
            placeholder="e.g., Basketball, Soccer"
            value={formData.sportType}
            onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
          />
          <Input
            label="Season"
            required
            placeholder="e.g., Fall 2024"
            value={formData.season}
            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Coach</label>
          <select
            value={formData.coachId}
            onChange={(e) => handleCoachChange(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a coach (optional)</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.firstName} {instructor.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Age Group"
            required
            placeholder="e.g., 8-12 years"
            value={formData.ageGroup}
            onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Skill Level</label>
            <select
              value={formData.skillLevel}
              onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value as any })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Capacity"
            type="number"
            required
            value={formData.capacity?.toString() || ''}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
          />
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="waitlistEnabled"
            checked={formData.waitlistEnabled || false}
            onChange={(e) => setFormData({ ...formData, waitlistEnabled: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
          />
          <label htmlFor="waitlistEnabled" className="ml-2 block text-sm text-neutral-700">
            Enable Waitlist
            <span className="block text-xs text-neutral-500">Allow members to join waitlist when program is full</span>
          </label>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="allowParents"
            checked={formData.allowParents || false}
            onChange={(e) => setFormData({ ...formData, allowParents: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
          />
          <label htmlFor="allowParents" className="ml-2 block text-sm text-neutral-700">
            Allow Parent Enrollment
            <span className="block text-xs text-neutral-500">By default, only children can enroll. Enable this to also allow parents/guardians.</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price ($)"
            type="number"
            step="0.01"
            required
            value={formData.pricing?.toString() || ''}
            onChange={(e) => setFormData({ ...formData, pricing: e.target.value ? parseFloat(e.target.value) : undefined })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Days of Week</label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  formData.schedule?.dayOfWeek?.includes(day)
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Start Time"
            type="time"
            required
            value={formData.schedule?.startTime}
            onChange={(e) =>
              setFormData({
                ...formData,
                schedule: { ...formData.schedule!, startTime: e.target.value },
              })
            }
          />
          <Input
            label="End Time"
            type="time"
            required
            value={formData.schedule?.endTime}
            onChange={(e) =>
              setFormData({
                ...formData,
                schedule: { ...formData.schedule!, endTime: e.target.value },
              })
            }
          />
          <Input
            label="Location"
            value={formData.schedule?.location}
            onChange={(e) =>
              setFormData({
                ...formData,
                schedule: { ...formData.schedule!, location: e.target.value },
              })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            required
            value={formData.startDate instanceof Date ? formData.startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
          />
          <Input
            label="End Date"
            type="date"
            required
            value={formData.endDate instanceof Date ? formData.endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
          />
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
            <option value="full">Full</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <ImageUpload
          key={`sport-image-${initialData?.id || 'new'}`}
          label="Sport Image"
          value={formData.imageURL}
          onChange={(url) => setFormData({ ...formData, imageURL: url })}
          folder="sports"
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {initialData ? 'Update' : 'Create'} Sport
          </Button>
        </div>
      </form>
    </Modal>
  );
};

