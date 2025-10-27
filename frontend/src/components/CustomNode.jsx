import React from 'react';
import { Handle, Position } from 'reactflow';

// Define icons for each node type (you can replace with a real icon library)
const nodeIcons = {
  headend: '🏢',
  fdh: '📦',
  splitter: '🔀',
  customer: '🏠',
  ont: '💻',
  router: '📡',
  default: '❓',
};

export default function CustomNode({ data }) {
  const { label, type, status, isFaulty } = data;
  const icon = nodeIcons[type] || nodeIcons.default;

  // Set base styles
  let baseClasses = 'bg-white border-2 rounded-lg shadow-md p-3 w-48';
  let borderClasses = 'border-gray-400';
  let statusClasses = 'bg-green-100 text-green-800';

  // Apply faulty/warning styles
  if (isFaulty) {
    borderClasses = 'border-red-500';
    statusClasses = 'bg-red-100 text-red-800';
  } else if (status === 'Pending') {
    borderClasses = 'border-yellow-500';
    statusClasses = 'bg-yellow-100 text-yellow-800';
  }

  return (
    <div className={`${baseClasses} ${borderClasses}`}>
      {/* Both top (target) and bottom (source) handles */}
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      
      <div className="flex items-center space-x-2">
        <div className="text-2xl">{icon}</div>
        <div>
          <div className="text-xs font-bold text-gray-500">{type.toUpperCase()}</div>
          <div className="text-sm font-medium text-black">{label}</div>
        </div>
      </div>
      
      {status && (
        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full text-center mt-2 ${statusClasses}`}>
          {status}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}
