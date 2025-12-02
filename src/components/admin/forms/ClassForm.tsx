import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { ImageUpload } from '../common/ImageUpload';
import { Class, Instructor } from '../../../types';
import { getInstructors } from '../../../services/instructors';

interface ClassFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Class>) => Promise<void>;
  initialData?: Class;
  title: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ClassForm: React.FC<ClassFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [formData, setFormData] = useState<Partial<Class>>({
    title: '',
    description: '',
    instructorId: '',
    instructorName: '',
    schedule: {
      dayOfWeek: [],
      startTime: '',
      endTime: '',
      location: '',
    },
    capacity: undefined,
    pricing: undefined,
    ageRequirement: '',
    gradeRequirement: '',
    prerequisites: [],
    materials: '',
    imageURL: '',
    startDate: new Date(),
    endDate: new Date(),
    status: 'active',
    category: '',
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

  const handleInstructorChange = (instructorId: string) => {
    const instructor = instructors.find(i => i.id === instructorId);
    setFormData({
      ...formData,
      instructorId,
      instructorName: instructor ? `${instructor.firstName} ${instructor.lastName}` : '',
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
          label="Class Title"
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

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Instructor</label>
          <select
            required
            value={formData.instructorId}
            onChange={(e) => handleInstructorChange(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select an instructor</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.firstName} {instructor.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
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
            <span className="block text-xs text-neutral-500">Allow members to join waitlist when class is full</span>
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

        <Input
          label="Price ($)"
          type="number"
          step="0.01"
          required
          value={formData.pricing?.toString() || ''}
          onChange={(e) => setFormData({ ...formData, pricing: e.target.value ? parseFloat(e.target.value) : undefined })}
        />

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

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Age Requirement"
            placeholder="e.g., 6-12 years"
            value={formData.ageRequirement}
            onChange={(e) => setFormData({ ...formData, ageRequirement: e.target.value })}
          />
          <Input
            label="Grade Requirement"
            placeholder="e.g., 1st-6th grade"
            value={formData.gradeRequirement}
            onChange={(e) => setFormData({ ...formData, gradeRequirement: e.target.value })}
          />
        </div>

        <Input
          label="Materials Needed"
          value={formData.materials}
          onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
        />

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
          key={`class-image-${initialData?.id || 'new'}`}
          label="Class Image"
          value={formData.imageURL}
          onChange={(url) => setFormData({ ...formData, imageURL: url })}
          folder="classes"
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {initialData ? 'Update' : 'Create'} Class
          </Button>
        </div>
      </form>
    </Modal>
  );
};

