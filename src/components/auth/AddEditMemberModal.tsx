import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FamilyMember } from '../../types';
import { Modal, Button, Input, Alert } from '../ui';
import { uploadProfilePhoto } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';

const memberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  relationship: z.enum(['parent', 'child', 'guardian']),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  gradeLevel: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface AddEditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Partial<FamilyMember>) => Promise<void>;
  member?: FamilyMember;
}

export const AddEditMemberModal: React.FC<AddEditMemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  member,
}) => {
  const { familyData } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    member?.photoURL || null
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: member
      ? {
          firstName: member.firstName,
          lastName: member.lastName,
          relationship: member.relationship,
          email: member.email || '',
          phone: member.phone || '',
          gradeLevel: member.gradeLevel || '',
          dateOfBirth: member.dateOfBirth
            ? new Date(member.dateOfBirth).toISOString().split('T')[0]
            : '',
        }
      : {},
  });

  useEffect(() => {
    if (member) {
      reset({
        firstName: member.firstName,
        lastName: member.lastName,
        relationship: member.relationship,
        email: member.email || '',
        phone: member.phone || '',
        gradeLevel: member.gradeLevel || '',
        dateOfBirth: member.dateOfBirth
          ? new Date(member.dateOfBirth).toISOString().split('T')[0]
          : '',
      });
      setPhotoPreview(member.photoURL || null);
    }
  }, [member, reset]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: MemberFormData) => {
    try {
      setError('');
      setIsLoading(true);

      let photoURL = member?.photoURL;

      // Upload photo if changed
      if (photoFile && familyData) {
        const memberId = member?.id || `temp_${Date.now()}`;
        photoURL = await uploadProfilePhoto(familyData.id, memberId, photoFile);
      }

      const memberData: Partial<FamilyMember> = {
        firstName: data.firstName,
        lastName: data.lastName,
        relationship: data.relationship,
        ...(member?.id && { id: member.id }),
        ...(photoURL && { photoURL }),
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.gradeLevel && { gradeLevel: data.gradeLevel }),
      };

      await onSave(memberData);
      onClose();
      reset();
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={member ? 'Edit Family Member' : 'Add Family Member'}
      size="lg"
    >
      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Photo upload */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Photo
          </label>
          <div className="flex items-center space-x-4">
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="h-20 w-20 rounded-full object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-sm text-neutral-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            {...register('firstName')}
            error={errors.firstName?.message}
            required
          />

          <Input
            label="Last Name"
            {...register('lastName')}
            error={errors.lastName?.message}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Relationship <span className="text-primary-600">*</span>
          </label>
          <select
            {...register('relationship')}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="parent">Parent</option>
            <option value="child">Child</option>
            <option value="guardian">Guardian</option>
          </select>
          {errors.relationship && (
            <p className="mt-1 text-sm text-red-600">{errors.relationship.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Phone"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Grade Level
            </label>
            <select
              {...register('gradeLevel')}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Grade Level</option>
              <option value="Pre-K">Pre-K</option>
              <option value="Kindergarten">Kindergarten</option>
              <option value="1st Grade">1st Grade</option>
              <option value="2nd Grade">2nd Grade</option>
              <option value="3rd Grade">3rd Grade</option>
              <option value="4th Grade">4th Grade</option>
              <option value="5th Grade">5th Grade</option>
              <option value="6th Grade">6th Grade</option>
              <option value="7th Grade">7th Grade</option>
              <option value="8th Grade">8th Grade</option>
              <option value="9th Grade">9th Grade</option>
              <option value="10th Grade">10th Grade</option>
              <option value="11th Grade">11th Grade</option>
              <option value="12th Grade">12th Grade</option>
            </select>
            {errors.gradeLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.gradeLevel.message}</p>
            )}
          </div>

          <Input
            label="Date of Birth"
            type="date"
            {...register('dateOfBirth')}
            error={errors.dateOfBirth?.message}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {member ? 'Save Changes' : 'Add Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

