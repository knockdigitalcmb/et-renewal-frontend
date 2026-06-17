import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext';

const Header = () => {
  const navigate = useNavigate();
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
