import React from 'react';

const CustomerFilters = ({ onSearch, onFilterChange }) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
      <input 
        type="text" 
        placeholder="Search by Name, Vehicle, Mobile, Lead..." 
        onChange={(e) => onSearch && onSearch(e.target.value)}
        className="w-full md:w-[300px] px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-600"
      />
      <select 
        onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
        className="w-full md:w-[200px] px-3 py-2 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800"
      >
        <option value="All Customers">All Customers</option>
        <option value="Pending Payments">Pending Payments</option>
        <option value="Fully Paid Customers">Fully Paid Customers</option>
      </select>
      <button 
        className="text-white px-4 py-2 rounded font-medium text-sm shadow-sm transition-colors hover:bg-blue-600 w-full md:w-auto"
        style={{ backgroundColor: '#3498db' }}
      >
        Search & Filter
      </button>
    </div>
  );
};

export default CustomerFilters;
