import React from 'react';
import { MdRemoveRedEye, MdEdit, MdRefresh } from 'react-icons/md';

const ActionButtons = () => {
  return (
    <div className="flex items-center space-x-1.5">
      <button 
        className="p-1.5 rounded text-white shadow-sm hover:opacity-90"
        style={{ backgroundColor: '#3498db' }}
        title="View"
      >
        <MdRemoveRedEye className="w-4 h-4" />
      </button>
      <button 
        className="p-1.5 rounded text-white shadow-sm hover:opacity-90"
        style={{ backgroundColor: '#f1c40f' }}
        title="Edit"
      >
        <MdEdit className="w-4 h-4" />
      </button>
      <button 
        className="p-1.5 rounded text-white shadow-sm hover:opacity-90"
        style={{ backgroundColor: '#2ecc71' }}
        title="Renewal"
      >
        <MdRefresh className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ActionButtons;
