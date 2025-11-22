import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { FamilyMember } from '../../types';
import { UserIcon } from '@heroicons/react/24/outline';

interface MemberSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onConfirm: (selectedMemberIds: string[]) => void;
  title: string;
  itemType: 'class' | 'sport' | 'event';
}

export const MemberSelectionModal: React.FC<MemberSelectionModalProps> = ({
  isOpen,
  onClose,
  members,
  onConfirm,
  title,
  itemType,
}) => {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const handleToggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleConfirm = () => {
    if (selectedMemberIds.length === 0) {
      return;
    }
    onConfirm(selectedMemberIds);
    setSelectedMemberIds([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedMemberIds([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add ${title} to Cart`}>
      <div className="space-y-4">
        <p className="text-neutral-600">
          Select which family members you want to enroll in this {itemType}:
        </p>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {members.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <UserIcon className="h-12 w-12 mx-auto mb-2 text-neutral-400" />
              <p>No family members found.</p>
              <p className="text-sm mt-1">Please add family members to your profile first.</p>
            </div>
          ) : (
            members.map((member) => (
              <label
                key={member.id}
                className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-600 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedMemberIds.includes(member.id)}
                  onChange={() => handleToggleMember(member.id)}
                  className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    {member.photoURL && (
                      <img
                        src={member.photoURL}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-neutral-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-neutral-600 capitalize">
                        {member.relationship}
                        {member.gradeLevel && ` • Grade ${member.gradeLevel}`}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            ))
          )}
        </div>

        {members.length > 0 && (
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600 mb-4">
              {selectedMemberIds.length === 0 ? (
                <span className="text-red-600">Please select at least one family member</span>
              ) : (
                <span>
                  {selectedMemberIds.length} member{selectedMemberIds.length !== 1 ? 's' : ''}{' '}
                  selected
                </span>
              )}
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedMemberIds.length === 0}
                className="flex-1"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

