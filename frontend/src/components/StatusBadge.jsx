import React from 'react';

// Helper function to get color classes based on status
const getStatusClasses = (status) => {
  switch (status) {
    case 'Available':
      return 'bg-green-100 text-green-800';
    case 'Assigned':
      return 'bg-blue-100 text-blue-800';
    case 'Faulty':
      return 'bg-yellow-100 text-yellow-800';
    case 'Retired':
      return 'bg-red-100 text-red-800';
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Inactive':
      return 'bg-gray-100 text-gray-800';
    case 'Pending':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function StatusBadge({ status }) {
  if (!status) return null;

  return (
    <span
      className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(
        status
      )}`}
    >
      {status}
    </span>
  );
}