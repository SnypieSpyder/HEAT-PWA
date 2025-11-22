import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/admin/common/DataTable';
import { StatusBadge } from '../../components/admin/common/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Family } from '../../types';
import { getFamilies, updateFamily } from '../../services/families';
import { EyeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export const AdminFamiliesPage: React.FC = () => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const data = await getFamilies();
      setFamilies(data);
    } catch (error) {
      console.error('Error fetching families:', error);
      setAlert({ type: 'error', message: 'Failed to load families' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMembershipStatus = async (familyId: string, status: 'active' | 'expired' | 'none') => {
    try {
      await updateFamily(familyId, { membershipStatus: status });
      setAlert({ type: 'success', message: 'Membership status updated successfully' });
      fetchFamilies();
      if (selectedFamily?.id === familyId) {
        setSelectedFamily({ ...selectedFamily, membershipStatus: status });
      }
    } catch (error) {
      console.error('Error updating membership status:', error);
      setAlert({ type: 'error', message: 'Failed to update membership status' });
    }
  };

  const viewFamilyDetails = (family: Family) => {
    setSelectedFamily(family);
    setShowDetailModal(true);
  };

  const columns: Column<Family>[] = [
    {
      key: 'familyName',
      header: 'Family Name',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-2">
          <UserGroupIcon className="h-5 w-5 text-neutral-400" />
          <span className="font-medium">{item.familyName}</span>
        </div>
      ),
    },
    {
      key: 'members',
      header: 'Members',
      render: (item) => <span>{item.members.length}</span>,
    },
    {
      key: 'primaryContact',
      header: 'Primary Contact',
      render: (item) => {
        const primaryContact = item.members.find(m => m.id === item.primaryContactId);
        return primaryContact ? (
          <div className="text-sm">
            <div>{primaryContact.firstName} {primaryContact.lastName}</div>
            <div className="text-neutral-500">{primaryContact.email}</div>
          </div>
        ) : (
          <span className="text-neutral-400">N/A</span>
        );
      },
    },
    {
      key: 'membershipStatus',
      header: 'Membership',
      sortable: true,
      render: (item) => <StatusBadge status={item.membershipStatus} type="membership" />,
    },
    {
      key: 'createdAt',
      header: 'Registered',
      sortable: true,
      render: (item) => item.createdAt.toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <button
          onClick={() => viewFamilyDetails(item)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        >
          <EyeIcon className="h-5 w-5" />
        </button>
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
            <h1 className="text-3xl font-bold text-neutral-900">Families Management</h1>
            <p className="text-neutral-600 mt-1">View and manage registered families</p>
          </div>
        </div>

        <DataTable
          data={families}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search families..."
          emptyMessage="No families registered yet."
        />

        {/* Family Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedFamily(null);
          }}
          title={selectedFamily?.familyName || 'Family Details'}
          size="lg"
        >
          {selectedFamily && (
            <div className="space-y-6">
              {/* Membership Status */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Membership Status
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedFamily.membershipStatus}
                    onChange={(e) => handleUpdateMembershipStatus(selectedFamily.id, e.target.value as any)}
                    className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="none">None</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                  <StatusBadge status={selectedFamily.membershipStatus} type="membership" />
                </div>
                {selectedFamily.membershipExpiry && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Expires: {selectedFamily.membershipExpiry.toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Address */}
              {selectedFamily.address && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Address</h3>
                  <div className="text-sm text-neutral-600">
                    <p>{selectedFamily.address.street}</p>
                    <p>
                      {selectedFamily.address.city}, {selectedFamily.address.state}{' '}
                      {selectedFamily.address.zipCode}
                    </p>
                  </div>
                </div>
              )}

              {/* Family Members */}
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Family Members</h3>
                <div className="space-y-3">
                  {selectedFamily.members.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-neutral-900">
                              {member.firstName} {member.lastName}
                            </h4>
                            {member.id === selectedFamily.primaryContactId && (
                              <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded-full">
                                Primary Contact
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-500 capitalize">{member.relationship}</p>
                          {member.email && (
                            <p className="text-sm text-neutral-600 mt-1">{member.email}</p>
                          )}
                          {member.phone && (
                            <p className="text-sm text-neutral-600">{member.phone}</p>
                          )}
                          {member.dateOfBirth && (
                            <p className="text-sm text-neutral-500 mt-1">
                              DOB: {member.dateOfBirth.toLocaleDateString()}
                            </p>
                          )}
                          {member.gradeLevel && (
                            <p className="text-sm text-neutral-500">Grade: {member.gradeLevel}</p>
                          )}
                        </div>
                        {member.photoURL && (
                          <img
                            src={member.photoURL}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registration Info */}
              <div className="pt-4 border-t border-neutral-200">
                <p className="text-xs text-neutral-500">
                  Registered: {selectedFamily.createdAt.toLocaleDateString()}
                </p>
                <p className="text-xs text-neutral-500">
                  Last Updated: {selectedFamily.updatedAt.toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedFamily(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

