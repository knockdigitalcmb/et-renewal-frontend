import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MdDashboard, MdPeople, MdPersonAdd, MdAutorenew, MdAddBox, MdList } from 'react-icons/md';
import { useLayout } from '../context/LayoutContext';

const Sidebar = () => {
  const location = useLocation();
  const { isSidebarOpen, closeSidebar } = useLayout();

  // Close sidebar on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeSidebar]);

  const getLinkClass = (path) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path) && path !== '/resources/list' && path !== '/resources/add');
    
    // Special handling for nested routes
    let isExactlyActive = location.pathname === path;
    if (path === '/resources/list' && (location.pathname === '/resources/list' || location.pathname.startsWith('/resources/view') || location.pathname.startsWith('/resources/edit'))) {
        isExactlyActive = true;
    }
    
    if (path === '/customers' && location.pathname.startsWith('/customers/view')) {
        isExactlyActive = true;
    }

    return `flex items-center px-6 py-3 border-l-4 transition-colors ${
      isExactlyActive
        ? 'font-medium bg-[#eef2ff] dark:bg-[#4361ee]/10 border-[#4361ee] text-[#4361ee] dark:text-[#4a6cf7]'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 border-transparent'
    }`;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}
      
      <aside className={`fixed top-0 left-0 h-screen w-[250px] bg-[#f8f9fa] dark:bg-gray-900 shadow-sm flex flex-col z-50 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#4361ee' }}>GPS Admin</h1>
          <button onClick={closeSidebar} className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none transition-colors">
            &times;
          </button>
        </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          <li>
            <NavLink to="/dashboard" onClick={closeSidebar} className={getLinkClass('/dashboard')}>
              <MdDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/customers" onClick={closeSidebar} className={getLinkClass('/customers')}>
              <MdPeople className="w-5 h-5 mr-3" />
              Customers
            </NavLink>
          </li>
          <li>
            <NavLink to="/customers/add" onClick={closeSidebar} className={getLinkClass('/customers/add')}>
              <MdPersonAdd className="w-5 h-5 mr-3" />
              Add Customer
            </NavLink>
          </li>
          <li>
            <NavLink to="/renewals" onClick={closeSidebar} className={getLinkClass('/renewals')}>
              <MdAutorenew className="w-5 h-5 mr-3" />
              Renewals
            </NavLink>
          </li>
        </ul>

        <div className="mt-8 mb-4 px-6">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">RESOURCES</h2>
        </div>
        
        <ul className="space-y-1">
          <li>
            <NavLink to="/resources/add" onClick={closeSidebar} className={getLinkClass('/resources/add')}>
              <MdAddBox className="w-5 h-5 mr-3" />
              Add Resource
            </NavLink>
          </li>
          <li>
            <NavLink to="/resources/list" onClick={closeSidebar} className={getLinkClass('/resources/list')}>
              <MdList className="w-5 h-5 mr-3" />
              Resource List
            </NavLink>
          </li>
        </ul>

        <div className="mt-8 mb-4 px-6">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">MASTER SETTINGS</h2>
        </div>
        
        <ul className="space-y-1">
          <li>
            <NavLink to="/master/vehicle-types" onClick={closeSidebar} className={getLinkClass('/master/vehicle-types')}>
              <MdList className="w-5 h-5 mr-3" />
              Vehicle Types
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
    </>
  );
};

export default Sidebar;
