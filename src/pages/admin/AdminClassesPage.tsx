import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/admin/common/DataTable';
import { StatusBadge } from '../../components/admin/common/StatusBadge';
import { ClassForm } from '../../components/admin/forms/ClassForm';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Class } from '../../types';
import { getClasses, createClass, updateClass, deleteClass } from '../../services/classes';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export const AdminClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; classId: string | null }>({
    show: false,
    classId: null,
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setAlert({ type: 'error', message: 'Failed to load classes' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<Class>) => {
    try {
      await createClass(data as Omit<Class, 'id' | 'createdAt' | 'updatedAt'>);
      setAlert({ type: 'success', message: 'Class created successfully' });
      fetchClasses();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating class:', error);
      setAlert({ type: 'error', message: 'Failed to create class' });
      throw error;
    }
  };

  const handleUpdate = async (data: Partial<Class>) => {
    if (!editingClass) return;
    try {
      await updateClass(editingClass.id, data);
      setAlert({ type: 'success', message: 'Class updated successfully' });
      fetchClasses();
      setShowForm(false);
      setEditingClass(undefined);
    } catch (error) {
      console.error('Error updating class:', error);
      setAlert({ type: 'error', message: 'Failed to update class' });
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.classId) return;
    try {
      await deleteClass(deleteConfirm.classId);
      setAlert({ type: 'success', message: 'Class deleted successfully' });
      fetchClasses();
      setDeleteConfirm({ show: false, classId: null });
    } catch (error) {
      console.error('Error deleting class:', error);
      setAlert({ type: 'error', message: 'Failed to delete class' });
    }
  };

  const openEditForm = (classItem: Class) => {
    setEditingClass(classItem);
    setShowForm(true);
  };

  const openCreateForm = () => {
    setEditingClass(undefined);
    setShowForm(true);
  };

  const columns: Column<Class>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
    },
    {
      key: 'instructorName',
      header: 'Instructor',
      sortable: true,
    },
    {
      key: 'schedule',
      header: 'Schedule',
      render: (item) => (
        <div className="text-xs">
          <div>{item.schedule.dayOfWeek.join(', ')}</div>
          <div className="text-neutral-500">
            {item.schedule.startTime} - {item.schedule.endTime}
          </div>
        </div>
      ),
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
      render: (item) => <StatusBadge status={item.status} type="class" />,
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
            onClick={() => setDeleteConfirm({ show: true, classId: item.id })}
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
            <h1 className="text-3xl font-bold text-neutral-900">Classes Management</h1>
            <p className="text-neutral-600 mt-1">Create and manage educational classes</p>
          </div>
          <Button onClick={openCreateForm}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Class
          </Button>
        </div>

        <DataTable
          data={classes}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search classes..."
          emptyMessage="No classes found. Create your first class to get started."
        />

        <ClassForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingClass(undefined);
          }}
          onSubmit={editingClass ? handleUpdate : handleCreate}
          initialData={editingClass}
          title={editingClass ? 'Edit Class' : 'Create New Class'}
        />

        <ConfirmModal
          isOpen={deleteConfirm.show}
          onClose={() => setDeleteConfirm({ show: false, classId: null })}
          onConfirm={handleDelete}
          title="Delete Class"
          message="Are you sure you want to delete this class? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
};

