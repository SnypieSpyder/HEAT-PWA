import React from 'react';
import { FamilyMember } from '../../types';
import { Card, Button, Badge } from '../ui';
import { PencilIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface FamilyMemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (memberId: string) => void;
  isPrimaryContact?: boolean;
}

export const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  onEdit,
  onDelete,
  isPrimaryContact = false,
}) => {
  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'parent':
        return 'primary';
      case 'child':
        return 'success';
      case 'guardian':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <Card className="relative" hover>
      <div className="flex items-start space-x-4">
        {/* Photo */}
        <div className="flex-shrink-0">
          {member.photoURL ? (
            <img
              src={member.photoURL}
              alt={`${member.firstName} ${member.lastName}`}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <UserCircleIcon className="h-16 w-16 text-neutral-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-lg font-semibold text-neutral-900">
              {member.firstName} {member.lastName}
            </h4>
            <Badge variant={getRelationshipColor(member.relationship) as any}>
              {member.relationship}
            </Badge>
            {isPrimaryContact && <Badge variant="warning">Primary</Badge>}
          </div>

          <div className="space-y-1 text-sm text-neutral-600">
            {member.email && (
              <p>
                <span className="font-medium">Email:</span> {member.email}
              </p>
            )}
            {member.phone && (
              <p>
                <span className="font-medium">Phone:</span> {member.phone}
              </p>
            )}
            {member.gradeLevel && (
              <p>
                <span className="font-medium">Grade:</span> {member.gradeLevel}
              </p>
            )}
            {member.dateOfBirth && (
              <p>
                <span className="font-medium">DOB:</span>{' '}
                {new Date(member.dateOfBirth).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(member)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          {!isPrimaryContact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(member.id)}
            >
              <TrashIcon className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

