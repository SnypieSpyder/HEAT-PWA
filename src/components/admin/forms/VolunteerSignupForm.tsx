import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { VolunteerSignup } from '../../../types';

interface VolunteerSignupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<VolunteerSignup, 'id' | 'createdAt'>) => Promise<void>;
  slotName: string;
  adminId: string;
}

export const VolunteerSignupForm: React.FC<VolunteerSignupFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  slotName,
  adminId,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        slotId: '', // Will be set by parent
        userId: undefined,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        addedBy: 'admin' as const,
        addedByAdminId: adminId,
      });
      setFormData({ name: '', email: '', phone: '' });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Volunteer - ${slotName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-neutral-600 mb-4">
          Manually add a volunteer who doesn't have an account in the system.
        </p>

        <Input
          label="Full Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

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
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Add Volunteer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

