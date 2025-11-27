import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/admin/common/DataTable';
import { StatusBadge } from '../../components/admin/common/StatusBadge';
import { PageBuilderForm } from '../../components/admin/forms/PageBuilderForm';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Page } from '../../types';
import { getPages, createPage, updatePage, deletePage } from '../../services/pages';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

export const AdminPagesPage: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; pageId: string | null }>({
    show: false,
    pageId: null,
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    filterPages();
  }, [pages, searchTerm, statusFilter]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await getPages();
      setPages(data);
    } catch (error) {
      console.error('Error fetching pages:', error);
      setAlert({ type: 'error', message: 'Failed to load pages' });
    } finally {
      setLoading(false);
    }
  };

  const filterPages = () => {
    let filtered = [...pages];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (page) =>
          page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((page) => page.status === statusFilter);
    }

    setFilteredPages(filtered);
  };

  const handleCreate = async (data: Partial<Page>) => {
    try {
      if (!currentUser) throw new Error('User not authenticated');
      
      await createPage({
        ...data,
        createdBy: currentUser.uid,
        updatedBy: currentUser.uid,
      } as Omit<Page, 'id' | 'createdAt' | 'updatedAt'>);
      
      setAlert({ type: 'success', message: 'Page created successfully' });
      fetchPages();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating page:', error);
      setAlert({ type: 'error', message: 'Failed to create page' });
      throw error;
    }
  };

  const handleUpdate = async (data: Partial<Page>) => {
    if (!editingPage || !currentUser) return;
    try {
      await updatePage(editingPage.id, {
        ...data,
        updatedBy: currentUser.uid,
      });
      setAlert({ type: 'success', message: 'Page updated successfully' });
      fetchPages();
      setShowForm(false);
      setEditingPage(undefined);
    } catch (error) {
      console.error('Error updating page:', error);
      setAlert({ type: 'error', message: 'Failed to update page' });
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.pageId) return;
    try {
      await deletePage(deleteConfirm.pageId);
      setAlert({ type: 'success', message: 'Page deleted successfully' });
      fetchPages();
      setDeleteConfirm({ show: false, pageId: null });
    } catch (error) {
      console.error('Error deleting page:', error);
      setAlert({ type: 'error', message: 'Failed to delete page' });
    }
  };

  const openEditForm = (page: Page) => {
    setEditingPage(page);
    setShowForm(true);
  };

  const openCreateForm = () => {
    setEditingPage(undefined);
    setShowForm(true);
  };

  const columns: Column<Page>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
    },
    {
      key: 'slug',
      header: 'Slug',
      sortable: true,
      render: (page) => (
        <code className="text-sm bg-neutral-100 px-2 py-1 rounded">/pages/{page.slug}</code>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (page) => (
        <StatusBadge
          status={page.status === 'published' ? 'Published' : 'Draft'}
        />
      ),
    },
    {
      key: 'showInNav',
      header: 'In Navigation',
      render: (page) => (
        <span className={page.showInNav ? 'text-green-600' : 'text-neutral-400'}>
          {page.showInNav ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      sortable: true,
      render: (page) => new Date(page.updatedAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (page) => (
        <div className="flex space-x-2">
          {page.status === 'published' && (
            <a
              href={`/pages/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
              title="View Page"
            >
              <EyeIcon className="h-5 w-5" />
            </a>
          )}
          <button
            onClick={() => openEditForm(page)}
            className="text-primary-600 hover:text-primary-800"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setDeleteConfirm({ show: true, pageId: page.id })}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container-custom py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Manage Pages</h1>
            <p className="text-neutral-600 mt-1">
              Create and manage custom pages for your site
            </p>
          </div>
          <Button onClick={openCreateForm} className="flex items-center space-x-2">
            <PlusIcon className="h-5 w-5" />
            <span>Create Page</span>
          </Button>
        </div>

        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by title or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable columns={columns} data={filteredPages} loading={loading} />

        {/* Page Builder Form Modal */}
        {showForm && (
          <PageBuilderForm
            page={editingPage}
            onSubmit={editingPage ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingPage(undefined);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteConfirm.show}
          onClose={() => setDeleteConfirm({ show: false, pageId: null })}
          title="Delete Page"
          message="Are you sure you want to delete this page? This action cannot be undone."
          confirmText="Delete"
          onConfirm={handleDelete}
          variant="danger"
        />
      </div>
    </div>
  );
};

