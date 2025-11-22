import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'class' | 'sport' | 'event' | 'volunteer' | 'membership' | 'payment';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    const normalizedStatus = status.toLowerCase();
    
    // Common status colors
    const statusMap: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      full: 'bg-yellow-100 text-yellow-800',
      upcoming: 'bg-purple-100 text-purple-800',
      ongoing: 'bg-indigo-100 text-indigo-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800',
      waitlist: 'bg-amber-100 text-amber-800',
      none: 'bg-gray-100 text-gray-800',
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      responded: 'bg-green-100 text-green-800',
    };

    return statusMap[normalizedStatus] || 'bg-gray-100 text-gray-800';
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
};

