import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { ImageUpload } from '../common/ImageUpload';
import { Instructor } from '../../../types';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface InstructorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Instructor>) => Promise<void>;
  initialData?: Instructor;
  title: string;
}

export const InstructorForm: React.FC<InstructorFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const [loading, setLoading] = useState(false);
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [formData, setFormData] = useState<Partial<Instructor>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    specialties: [],
    photoURL: '',
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
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSpecialty = () => {
    if (specialtyInput.trim()) {
      setFormData({
        ...formData,
        specialties: [...(formData.specialties || []), specialtyInput.trim()],
      });
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (index: number) => {
    setFormData({
      ...formData,
      specialties: formData.specialties?.filter((_, i) => i !== index),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <Input
            label="Last Name"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>

        <Input
          label="Email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Bio</label>
          <textarea
            required
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={6}
            placeholder="Tell us about the instructor's background, experience, and teaching philosophy..."
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Specialties</label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a specialty (e.g., Mathematics, Piano)"
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addSpecialty}>
              <PlusIcon className="h-5 w-5" />
            </Button>
          </div>
          {formData.specialties && formData.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(index)}
                    className="hover:text-primary-900"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <ImageUpload
          label="Instructor Photo"
          value={formData.photoURL}
          onChange={(url) => setFormData({ ...formData, photoURL: url })}
          folder="instructors"
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {initialData ? 'Update' : 'Create'} Instructor
          </Button>
        </div>
      </form>
    </Modal>
  );
};

