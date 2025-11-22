import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FamilyMember, Address } from '../../types';
import { Button, Card, CardHeader, CardTitle, CardContent, Alert, ConfirmModal, Input, Modal } from '../../components/ui';
import { FamilyMemberCard } from '../../components/auth/FamilyMemberCard';
import { AddEditMemberModal } from '../../components/auth/AddEditMemberModal';
import { PlusIcon, ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

export const FamilyProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { familyData, refreshFamilyData } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressData, setAddressData] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

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

  const handleDeleteMember = (memberId: string) => {
    setMemberToDelete(memberId);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      const updatedMembers = familyData.members.filter((m) => m.id !== memberToDelete);
      const familyRef = doc(db, 'families', familyData.id);
      await updateDoc(familyRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });
      
      // Refresh family data to show updated list
      await refreshFamilyData();
      
      setSuccess('Family member removed successfully');
      setTimeout(() => setSuccess(''), 3000);
      setIsConfirmDeleteOpen(false);
      setMemberToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove family member');
      setIsConfirmDeleteOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleEditAddress = () => {
    setAddressData({
      street: familyData?.address?.street || '',
      city: familyData?.address?.city || '',
      state: familyData?.address?.state || '',
      zipCode: familyData?.address?.zipCode || '',
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async () => {
    try {
      setError('');
      
      // Validate required fields
      if (!addressData.street || !addressData.city || !addressData.state || !addressData.zipCode) {
        setError('All address fields are required');
        return;
      }

      const familyRef = doc(db, 'families', familyData.id);
      await updateDoc(familyRef, {
        address: addressData,
        updatedAt: serverTimestamp(),
      });

      // Refresh family data
      await refreshFamilyData();

      setSuccess('Address updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setIsAddressModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update address');
    }
  };

  const handleSaveMember = async (memberData: Partial<FamilyMember>) => {
    try {
      setError('');
      
      let updatedMembers: FamilyMember[];

      if (memberData.id && familyData.members.find((m) => m.id === memberData.id)) {
        // Update existing member - only include defined values
        updatedMembers = familyData.members.map((m) => {
          if (m.id === memberData.id) {
            const updatedMember: FamilyMember = {
              id: m.id,
              firstName: memberData.firstName ?? m.firstName,
              lastName: memberData.lastName ?? m.lastName,
              relationship: memberData.relationship ?? m.relationship,
            };
            // Only add optional fields if they exist
            if (memberData.email) updatedMember.email = memberData.email;
            else if (m.email) updatedMember.email = m.email;
            
            if (memberData.phone) updatedMember.phone = memberData.phone;
            else if (m.phone) updatedMember.phone = m.phone;
            
            if (memberData.gradeLevel) updatedMember.gradeLevel = memberData.gradeLevel;
            else if (m.gradeLevel) updatedMember.gradeLevel = m.gradeLevel;
            
            if (memberData.dateOfBirth) updatedMember.dateOfBirth = memberData.dateOfBirth;
            else if (m.dateOfBirth) updatedMember.dateOfBirth = m.dateOfBirth;
            
            if (memberData.photoURL) updatedMember.photoURL = memberData.photoURL;
            else if (m.photoURL) updatedMember.photoURL = m.photoURL;
            
            return updatedMember;
          }
          return m;
        });
      } else {
        // Add new member - only include defined values
        const newMember: FamilyMember = {
          id: `member_${Date.now()}`,
          firstName: memberData.firstName!,
          lastName: memberData.lastName!,
          relationship: memberData.relationship!,
        };
        
        // Only add optional fields if they are provided
        if (memberData.email) newMember.email = memberData.email;
        if (memberData.phone) newMember.phone = memberData.phone;
        if (memberData.gradeLevel) newMember.gradeLevel = memberData.gradeLevel;
        if (memberData.dateOfBirth) newMember.dateOfBirth = memberData.dateOfBirth;
        if (memberData.photoURL) newMember.photoURL = memberData.photoURL;
        
        updatedMembers = [...familyData.members, newMember];
      }

      const familyRef = doc(db, 'families', familyData.id);
      await updateDoc(familyRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });

      // Refresh family data to show updated list
      await refreshFamilyData();

      setSuccess('Family member saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      throw err;
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-neutral-600 hover:text-neutral-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
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
            <div className="flex items-center justify-between">
              <CardTitle>Address</CardTitle>
              <Button onClick={handleEditAddress} size="sm" variant="outline">
                <PencilIcon className="h-4 w-4 mr-2" />
                {familyData.address ? 'Edit' : 'Add Address'}
              </Button>
            </div>
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={confirmDeleteMember}
        title="Remove Family Member"
        message="Are you sure you want to remove this family member? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Address Edit Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Edit Address"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Street Address"
            value={addressData.street}
            onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
            placeholder="123 Main Street"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="City"
              value={addressData.city}
              onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
              placeholder="Tampa"
              required
            />

            <Input
              label="State"
              value={addressData.state}
              onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
              placeholder="FL"
              required
            />
          </div>

          <Input
            label="ZIP Code"
            value={addressData.zipCode}
            onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
            placeholder="33602"
            required
          />

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => setIsAddressModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAddress}>
              Save Address
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

