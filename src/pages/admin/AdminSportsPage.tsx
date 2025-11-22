import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/admin/common/DataTable';
import { StatusBadge } from '../../components/admin/common/StatusBadge';
import { SportForm } from '../../components/admin/forms/SportForm';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Sport } from '../../types';
import { getSports, createSport, updateSport, deleteSport } from '../../services/sports';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export const AdminSportsPage: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; sportId: string | null }>({
    show: false,
    sportId: null,
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      setLoading(true);
      const data = await getSports();
      setSports(data);
    } catch (error) {
      console.error('Error fetching sports:', error);
      setAlert({ type: 'error', message: 'Failed to load sports' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<Sport>) => {
    try {
      await createSport(data as Omit<Sport, 'id' | 'createdAt' | 'updatedAt'>);
      setAlert({ type: 'success', message: 'Sport created successfully' });
      fetchSports();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating sport:', error);
      setAlert({ type: 'error', message: 'Failed to create sport' });
      throw error;
    }
  };

  const handleUpdate = async (data: Partial<Sport>) => {
    if (!editingSport) return;
    try {
      await updateSport(editingSport.id, data);
      setAlert({ type: 'success', message: 'Sport updated successfully' });
      fetchSports();
      setShowForm(false);
      setEditingSport(undefined);
    } catch (error) {
      console.error('Error updating sport:', error);
      setAlert({ type: 'error', message: 'Failed to update sport' });
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.sportId) return;
    try {
      await deleteSport(deleteConfirm.sportId);
      setAlert({ type: 'success', message: 'Sport deleted successfully' });
      fetchSports();
      setDeleteConfirm({ show: false, sportId: null });
    } catch (error) {
      console.error('Error deleting sport:', error);
      setAlert({ type: 'error', message: 'Failed to delete sport' });
    }
  };

  const openEditForm = (sport: Sport) => {
    setEditingSport(sport);
    setShowForm(true);
  };

  const openCreateForm = () => {
    setEditingSport(undefined);
    setShowForm(true);
  };

  const columns: Column<Sport>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
    },
    {
      key: 'sportType',
      header: 'Sport Type',
      sortable: true,
    },
    {
      key: 'season',
      header: 'Season',
      sortable: true,
    },
    {
      key: 'ageGroup',
      header: 'Age Group',
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (item) => (
        <span>
          {item.enrolled} / {item.capacity}
        </span>
      ),
    },
    {
      key: 'pricing',
      header: 'Price',
      render: (item) => <span>${item.pricing.toFixed(2)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} type="sport" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openEditForm(item)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteConfirm({ show: true, sportId: item.id })}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
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
            <h1 className="text-3xl font-bold text-neutral-900">Sports Management</h1>
            <p className="text-neutral-600 mt-1">Create and manage sports programs</p>
          </div>
          <Button onClick={openCreateForm}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Sport
          </Button>
        </div>

        <DataTable
          data={sports}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search sports..."
          emptyMessage="No sports found. Create your first sport program to get started."
        />

        <SportForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingSport(undefined);
          }}
          onSubmit={editingSport ? handleUpdate : handleCreate}
          initialData={editingSport}
          title={editingSport ? 'Edit Sport' : 'Create New Sport'}
        />

        <ConfirmModal
          isOpen={deleteConfirm.show}
          onClose={() => setDeleteConfirm({ show: false, sportId: null })}
          onConfirm={handleDelete}
          title="Delete Sport"
          message="Are you sure you want to delete this sport program? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
};

