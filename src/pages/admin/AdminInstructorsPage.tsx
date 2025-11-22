import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/admin/common/DataTable';
import { UserSearchInput } from '../../components/admin/common/UserSearchInput';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Instructor } from '../../types';
import { getInstructors, createInstructor, deleteInstructor } from '../../services/instructors';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export const AdminInstructorsPage: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; instructorId: string | null }>({
    show: false,
    instructorId: null,
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const data = await getInstructors();
      setInstructors(data);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setAlert({ type: 'error', message: 'Failed to load instructors' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.instructorId) return;
    try {
      await deleteInstructor(deleteConfirm.instructorId);
      setAlert({ type: 'success', message: 'Instructor removed successfully' });
      fetchInstructors();
      setDeleteConfirm({ show: false, instructorId: null });
    } catch (error) {
      console.error('Error removing instructor:', error);
      setAlert({ type: 'error', message: 'Failed to remove instructor' });
    }
  };

  const openUserSearch = () => {
    setShowUserSearch(true);
  };

  const handleUserSelected = async (userData: { id: string; name: string; email: string }) => {
    setShowUserSearch(false);
    
    try {
      // Parse the name
      const nameParts = userData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Create instructor record with basic user data
      await createInstructor({
        userId: userData.id,
        firstName,
        lastName,
        email: userData.email,
        phone: '',
        bio: '',
        specialties: [],
        photoURL: '',
      });
      
      setAlert({ type: 'success', message: `${userData.name} has been added as an instructor` });
      fetchInstructors();
    } catch (error) {
      console.error('Error creating instructor:', error);
      setAlert({ type: 'error', message: 'Failed to add instructor. They may already be an instructor.' });
    }
  };

  const columns: Column<Instructor>[] = [
    {
      key: 'firstName',
      header: 'Name',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-3">
          {item.photoURL ? (
            <img
              src={item.photoURL}
              alt={`${item.firstName} ${item.lastName}`}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-medium">
                {item.firstName[0]}
                {item.lastName[0]}
              </span>
            </div>
          )}
          <span className="font-medium">
            {item.firstName} {item.lastName}
          </span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Phone',
    },
    {
      key: 'specialties',
      header: 'Specialties',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.specialties.slice(0, 2).map((specialty, index) => (
            <span
              key={index}
              className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {specialty}
            </span>
          ))}
          {item.specialties.length > 2 && (
            <span className="text-xs text-neutral-500">+{item.specialties.length - 2} more</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex space-x-2">
          <button
            onClick={() => setDeleteConfirm({ show: true, instructorId: item.id })}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Remove instructor"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container-custom py-8">
      <div className="max-w-7xl mx-auto">
        {alert && (
          <div className="mb-4">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Instructors Management</h1>
            <p className="text-neutral-600 mt-1">Manage instructors and coaches</p>
          </div>
          <Button onClick={openUserSearch}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Instructor
          </Button>
        </div>

        <DataTable
          data={instructors}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search instructors..."
          emptyMessage="No instructors found. Add your first instructor to get started."
        />

        {/* User Search Modal */}
        <Modal
          isOpen={showUserSearch}
          onClose={() => setShowUserSearch(false)}
          title="Select User to Make Instructor"
        >
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Search for a registered user to add as an instructor. The user must already have an account in the system.
            </p>
            <UserSearchInput
              onSelect={handleUserSelected}
              placeholder="Search by name or email..."
              label="Search for User"
            />
          </div>
        </Modal>

        <ConfirmModal
          isOpen={deleteConfirm.show}
          onClose={() => setDeleteConfirm({ show: false, instructorId: null })}
          onConfirm={handleDelete}
          title="Remove Instructor"
          message="Are you sure you want to remove this instructor? They will no longer be able to be assigned to classes."
          confirmText="Remove"
          variant="danger"
        />
      </div>
    </div>
  );
};

