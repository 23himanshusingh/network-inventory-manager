import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      {/* Modal Content - Changed to max-w-lg */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg" 
        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}