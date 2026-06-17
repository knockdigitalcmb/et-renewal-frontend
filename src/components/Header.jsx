import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSidebar } = useLayout();

  const HamburgerButton = () => (
    <button 
      onClick={toggleSidebar}
      className="md:hidden mr-4 text-gray-600 hover:text-gray-900 focus:outline-none"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );

  if (location.pathname === '/customers') {
    return (
      <header className="bg-white py-4 px-4 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 gap-4">
        <div className="flex items-center">
          <HamburgerButton />
          <h2 className="text-xl font-bold text-gray-800">Customer List</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate('/customers/add')}
            className="flex-1 md:flex-none text-white px-4 py-2 rounded font-medium text-sm shadow-sm hover:opacity-90 transition-colors whitespace-nowrap"
            style={{ backgroundColor: '#4361ee' }}
          >
            + New Customer / Vehicle
          </button>
          <button 
            onClick={() => navigate('/customers/import')}
            className="flex-1 md:flex-none text-black px-4 py-2 rounded font-medium text-sm shadow-sm hover:opacity-90 transition-colors whitespace-nowrap"
            style={{ backgroundColor: '#2ecc71' }}
          >
            + Import Customers
          </button>
          <button 
            onClick={() => {
              const link = document.createElement('a');
              link.href = 'data:text/csv;charset=utf-8,Name,Mobile,Location,Device Price\nSample Customer,1234567890,Sample Location,1000';
              link.download = 'sample_customers.csv';
              link.click();
            }}
            className="w-full md:w-auto text-white px-4 py-2 rounded font-medium text-sm shadow-sm hover:opacity-90 transition-colors whitespace-nowrap"
            style={{ backgroundColor: '#3498db' }}
          >
            Download Sample Excel
          </button>
        </div>
      </header>
    );
  }

  // Default header
  return (
    <header className="bg-white h-[72px] flex items-center justify-between px-4 md:px-8 border-b border-gray-200">
      <div className="flex items-center">
        <HamburgerButton />
        <h2 className="text-xl font-bold text-gray-800">Welcome, admin</h2>
      </div>
      <button 
        onClick={() => navigate('/login')}
        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md font-medium transition-colors shadow-sm"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
