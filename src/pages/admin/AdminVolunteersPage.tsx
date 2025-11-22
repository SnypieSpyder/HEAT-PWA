import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/admin/common/StatusBadge';
import { UserSearchInput } from '../../components/admin/common/UserSearchInput';
import { VolunteerOpportunityForm } from '../../components/admin/forms/VolunteerOpportunityForm';
import { VolunteerSignupForm } from '../../components/admin/forms/VolunteerSignupForm';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { VolunteerOpportunity, VolunteerSignup } from '../../types';
import {
  getVolunteerOpportunities,
  createVolunteerOpportunity,
  updateVolunteerOpportunity,
  deleteVolunteerOpportunity,
  addVolunteerSignup,
  removeVolunteerSignup,
} from '../../services/volunteers';
import { useAuth } from '../../contexts/AuthContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const AdminVolunteersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<VolunteerOpportunity | undefined>();
  const [showManualSignupForm, setShowManualSignupForm] = useState(false);
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<{ opportunityId: string; slotId: string; slotName: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    type: 'opportunity' | 'signup';
    id: string | null;
    signupData?: { opportunityId: string; slotId: string; signupId: string };
  }>({
    show: false,
    type: 'opportunity',
    id: null,
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await getVolunteerOpportunities();
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setAlert({ type: 'error', message: 'Failed to load volunteer opportunities' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpportunity = async (data: Partial<VolunteerOpportunity>) => {
    try {
      await createVolunteerOpportunity(data as Omit<VolunteerOpportunity, 'id' | 'createdAt' | 'updatedAt'>);
      setAlert({ type: 'success', message: 'Volunteer opportunity created successfully' });
      fetchOpportunities();
      setShowOpportunityForm(false);
    } catch (error) {
      console.error('Error creating opportunity:', error);
      setAlert({ type: 'error', message: 'Failed to create volunteer opportunity' });
      throw error;
    }
  };

  const handleUpdateOpportunity = async (data: Partial<VolunteerOpportunity>) => {
    if (!editingOpportunity) return;
    try {
      await updateVolunteerOpportunity(editingOpportunity.id, data);
      setAlert({ type: 'success', message: 'Volunteer opportunity updated successfully' });
      fetchOpportunities();
      setShowOpportunityForm(false);
      setEditingOpportunity(undefined);
    } catch (error) {
      console.error('Error updating opportunity:', error);
      setAlert({ type: 'error', message: 'Failed to update volunteer opportunity' });
      throw error;
    }
  };

  const handleDeleteOpportunity = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteVolunteerOpportunity(deleteConfirm.id);
      setAlert({ type: 'success', message: 'Volunteer opportunity deleted successfully' });
      fetchOpportunities();
      setDeleteConfirm({ show: false, type: 'opportunity', id: null });
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      setAlert({ type: 'error', message: 'Failed to delete volunteer opportunity' });
    }
  };

  const handleAddManualSignup = async (signupData: Omit<VolunteerSignup, 'id' | 'createdAt'>) => {
    if (!currentSlot) return;
    try {
      await addVolunteerSignup(currentSlot.opportunityId, currentSlot.slotId, signupData);
      setAlert({ type: 'success', message: 'Volunteer added successfully' });
      fetchOpportunities();
      setShowManualSignupForm(false);
      setCurrentSlot(null);
    } catch (error) {
      console.error('Error adding volunteer:', error);
      setAlert({ type: 'error', message: 'Failed to add volunteer' });
      throw error;
    }
  };

  const handleAddUserSignup = async (userData: { id: string; name: string; email: string }) => {
    if (!currentSlot) return;
    try {
      await addVolunteerSignup(currentSlot.opportunityId, currentSlot.slotId, {
        slotId: currentSlot.slotId,
        userId: userData.id,
        name: userData.name,
        email: userData.email,
        phone: '',
        addedBy: 'admin',
        addedByAdminId: currentUser?.uid || '',
      });
      setAlert({ type: 'success', message: 'Volunteer added successfully' });
      fetchOpportunities();
      setShowUserSearchModal(false);
      setCurrentSlot(null);
    } catch (error) {
      console.error('Error adding volunteer:', error);
      setAlert({ type: 'error', message: 'Failed to add volunteer' });
    }
  };

  const handleDeleteSignup = async () => {
    if (!deleteConfirm.signupData) return;
    try {
      await removeVolunteerSignup(
        deleteConfirm.signupData.opportunityId,
        deleteConfirm.signupData.slotId,
        deleteConfirm.signupData.signupId
      );
      setAlert({ type: 'success', message: 'Volunteer removed successfully' });
      fetchOpportunities();
      setDeleteConfirm({ show: false, type: 'signup', id: null });
    } catch (error) {
      console.error('Error removing volunteer:', error);
      setAlert({ type: 'error', message: 'Failed to remove volunteer' });
    }
  };

  const openAddVolunteerMenu = (opportunityId: string, slotId: string, slotName: string) => {
    setCurrentSlot({ opportunityId, slotId, slotName });
  };

  const exportToPDF = (opportunity: VolunteerOpportunity) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.text(opportunity.title, 14, 20);
    
    // Event details
    doc.setFontSize(10);
    doc.text(`Date: ${opportunity.date.toLocaleDateString()}`, 14, 30);
    doc.text(`Time: ${opportunity.startTime} - ${opportunity.endTime}`, 14, 36);
    doc.text(`Location: ${opportunity.location}`, 14, 42);
    
    // Prepare table data
    const tableData: any[] = [];
    opportunity.slots.forEach(slot => {
      slot.signups.forEach(signup => {
        tableData.push([
          slot.name,
          signup.name,
          signup.email,
          signup.phone,
          signup.addedBy,
          signup.createdAt.toLocaleDateString()
        ]);
      });
    });
    
    // Generate table using autoTable
    autoTable(doc, {
      startY: 50,
      head: [['Slot', 'Volunteer Name', 'Email', 'Phone', 'Added By', 'Date']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] }, // primary red color
      styles: { fontSize: 9 },
    });
    
    // Save the PDF
    doc.save(`${opportunity.title.replace(/\s+/g, '_')}_volunteers.pdf`);
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-7xl mx-auto">
        {alert && (
          <div className="mb-4">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Volunteer Management</h1>
            <p className="text-neutral-600 mt-1">Manage volunteer opportunities and signups</p>
          </div>
          <Button onClick={() => {
            setEditingOpportunity(undefined);
            setShowOpportunityForm(true);
          }}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Opportunity
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">Loading opportunities...</p>
          </div>
        ) : opportunities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-neutral-500">No volunteer opportunities yet. Create one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <CardTitle>{opportunity.title}</CardTitle>
                        <StatusBadge status={opportunity.status} type="volunteer" />
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">{opportunity.description}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-neutral-600">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {opportunity.date.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {opportunity.startTime} - {opportunity.endTime}
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {opportunity.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToPDF(opportunity)}
                      >
                        Export PDF
                      </Button>
                      <button
                        onClick={() => {
                          setEditingOpportunity(opportunity);
                          setShowOpportunityForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ show: true, type: 'opportunity', id: opportunity.id })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {opportunity.slots.map((slot) => (
                      <div key={slot.id} className="border border-neutral-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-neutral-900">{slot.name}</h4>
                            <p className="text-sm text-neutral-500">{slot.when}</p>
                            <p className="text-sm text-neutral-600 mt-1">
                              {slot.signups.length} / {slot.capacity} volunteers
                            </p>
                          </div>
                          <div className="relative">
                            {currentSlot?.slotId === slot.id ? (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setShowUserSearchModal(true);
                                  }}
                                >
                                  Search Users
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setShowManualSignupForm(true);
                                  }}
                                >
                                  Manual Entry
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCurrentSlot(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openAddVolunteerMenu(opportunity.id, slot.id, slot.name)}
                                disabled={slot.signups.length >= slot.capacity}
                              >
                                <UserPlusIcon className="h-4 w-4 mr-1" />
                                Add Volunteer
                              </Button>
                            )}
                          </div>
                        </div>

                        {slot.signups.length > 0 && (
                          <div className="space-y-2">
                            {slot.signups.map((signup) => (
                              <div
                                key={signup.id}
                                className="flex items-center justify-between p-3 bg-neutral-50 rounded-md"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-neutral-900">{signup.name}</p>
                                  <p className="text-xs text-neutral-600">{signup.email}</p>
                                  {signup.phone && (
                                    <p className="text-xs text-neutral-600">{signup.phone}</p>
                                  )}
                                  <p className="text-xs text-neutral-500 mt-1">
                                    Added by {signup.addedBy === 'admin' ? 'admin' : 'self-signup'} on{' '}
                                    {signup.createdAt.toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({
                                      show: true,
                                      type: 'signup',
                                      id: signup.id,
                                      signupData: {
                                        opportunityId: opportunity.id,
                                        slotId: slot.id,
                                        signupId: signup.id,
                                      },
                                    })
                                  }
                                  className="p-2 text-red-600 hover:bg-red-50 rounded ml-4"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Opportunity Form Modal */}
        <VolunteerOpportunityForm
          isOpen={showOpportunityForm}
          onClose={() => {
            setShowOpportunityForm(false);
            setEditingOpportunity(undefined);
          }}
          onSubmit={editingOpportunity ? handleUpdateOpportunity : handleCreateOpportunity}
          initialData={editingOpportunity}
          title={editingOpportunity ? 'Edit Volunteer Opportunity' : 'Create Volunteer Opportunity'}
        />

        {/* Manual Signup Form */}
        {currentSlot && (
          <VolunteerSignupForm
            isOpen={showManualSignupForm}
            onClose={() => {
              setShowManualSignupForm(false);
            }}
            onSubmit={handleAddManualSignup}
            slotName={currentSlot.slotName}
            adminId={currentUser?.uid || ''}
          />
        )}

        {/* User Search Modal */}
        <Modal
          isOpen={showUserSearchModal}
          onClose={() => {
            setShowUserSearchModal(false);
          }}
          title={`Add Volunteer - ${currentSlot?.slotName}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Search for a registered user to add as a volunteer.
            </p>
            <UserSearchInput
              onSelect={(result) => handleAddUserSignup(result)}
              placeholder="Search by name or email..."
            />
          </div>
        </Modal>

        {/* Delete Confirm Modal */}
        <ConfirmModal
          isOpen={deleteConfirm.show}
          onClose={() => setDeleteConfirm({ show: false, type: 'opportunity', id: null })}
          onConfirm={deleteConfirm.type === 'opportunity' ? handleDeleteOpportunity : handleDeleteSignup}
          title={deleteConfirm.type === 'opportunity' ? 'Delete Opportunity' : 'Remove Volunteer'}
          message={
            deleteConfirm.type === 'opportunity'
              ? 'Are you sure you want to delete this volunteer opportunity? All signups will be removed.'
              : 'Are you sure you want to remove this volunteer from the signup list?'
          }
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
};


