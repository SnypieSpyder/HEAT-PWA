import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FamilyMember } from '../../types';
import { Button, Card, CardHeader, CardTitle, CardContent, Alert } from '../../components/ui';
import { FamilyMemberCard } from '../../components/auth/FamilyMemberCard';
import { AddEditMemberModal } from '../../components/auth/AddEditMemberModal';
import { PlusIcon } from '@heroicons/react/24/outline';

export const FamilyProfilePage: React.FC = () => {
  const { familyData } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!familyData) {
    return (
      <div className="container-custom py-8">
        <Alert type="error" message="Family data not found" />
      </div>
    );
  }

  const handleAddMember = () => {
    setEditingMember(undefined);
    setIsModalOpen(true);
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this family member?')) {
      return;
    }

    try {
      const updatedMembers = familyData.members.filter((m) => m.id !== memberId);
      const familyRef = doc(db, 'families', familyData.id);
      await updateDoc(familyRef, {
        members: updatedMembers,
        updatedAt: new Date(),
      });
      setSuccess('Family member removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove family member');
    }
  };

  const handleSaveMember = async (memberData: Partial<FamilyMember>) => {
    try {
      setError('');
      
      let updatedMembers: FamilyMember[];

      if (memberData.id && familyData.members.find((m) => m.id === memberData.id)) {
        // Update existing member
        updatedMembers = familyData.members.map((m) =>
          m.id === memberData.id ? { ...m, ...memberData } as FamilyMember : m
        );
      } else {
        // Add new member
        const newMember: FamilyMember = {
          id: `member_${Date.now()}`,
          firstName: memberData.firstName!,
          lastName: memberData.lastName!,
          relationship: memberData.relationship!,
          email: memberData.email,
          phone: memberData.phone,
          gradeLevel: memberData.gradeLevel,
          dateOfBirth: memberData.dateOfBirth,
          photoURL: memberData.photoURL,
        };
        updatedMembers = [...familyData.members, newMember];
      }

      const familyRef = doc(db, 'families', familyData.id);
      await updateDoc(familyRef, {
        members: updatedMembers,
        updatedAt: new Date(),
      });

      setSuccess('Family member saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      throw err;
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {familyData.familyName}
          </h1>
          <p className="text-neutral-600">Manage your family profile and members</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}
        {success && (
          <div className="mb-4">
            <Alert type="success" message={success} onClose={() => setSuccess('')} />
          </div>
        )}

        {/* Membership Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Membership Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Status</p>
                <p className="text-lg font-semibold capitalize">
                  {familyData.membershipStatus}
                </p>
                {familyData.membershipExpiry && (
                  <p className="text-sm text-neutral-600 mt-1">
                    Expires: {new Date(familyData.membershipExpiry).toLocaleDateString()}
                  </p>
                )}
              </div>
              {familyData.membershipStatus !== 'active' && (
                <Button>Purchase Membership</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Family Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Family Members</CardTitle>
              <Button onClick={handleAddMember} size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {familyData.members.map((member) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  onEdit={handleEditMember}
                  onDelete={handleDeleteMember}
                  isPrimaryContact={member.id === familyData.primaryContactId}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Address Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            {familyData.address ? (
              <div className="text-neutral-700">
                <p>{familyData.address.street}</p>
                <p>
                  {familyData.address.city}, {familyData.address.state}{' '}
                  {familyData.address.zipCode}
                </p>
              </div>
            ) : (
              <p className="text-neutral-600 text-sm">No address on file</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <AddEditMemberModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(undefined);
        }}
        onSave={handleSaveMember}
        member={editingMember}
      />
    </div>
  );
};

