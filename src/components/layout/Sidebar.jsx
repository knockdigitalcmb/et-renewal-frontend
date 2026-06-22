import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  MdDashboard, MdPeople, MdPersonAdd, MdAutorenew, 
  MdAddBox, MdList, MdSettings, MdKeyboardArrowDown, MdKeyboardArrowRight, MdDirectionsCar 
} from 'react-icons/md';
import { useLayout } from '../../context/LayoutContext';

const Sidebar = () => {
  const location = useLocation();
  const { isSidebarOpen, closeSidebar } = useLayout();

  // Determine initial open states based on active routes
  const [openMenus, setOpenMenus] = useState({
    customers: location.pathname.startsWith('/customers') || location.pathname.startsWith('/renewals'),
    resources: location.pathname.startsWith('/resources'),
    devices: location.pathname.startsWith('/devices'),
    master: location.pathname.startsWith('/settings')
  });

  // Keep menus open if we navigate to a child route from elsewhere
  useEffect(() => {
    if (location.pathname.startsWith('/customers') || location.pathname.startsWith('/renewals')) {
      setOpenMenus(prev => ({ ...prev, customers: true }));
    }
    if (location.pathname.startsWith('/resources')) {
      setOpenMenus(prev => ({ ...prev, resources: true }));
    }
    if (location.pathname.startsWith('/devices')) {
      setOpenMenus(prev => ({ ...prev, devices: true }));
    }
    if (location.pathname.startsWith('/settings')) {
      setOpenMenus(prev => ({ ...prev, master: true }));
    }
  }, [location.pathname]);

  // Close sidebar on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeSidebar]);

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isRouteActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    // Special logic for lists vs view/edit
    if (path === '/customers') {
      return location.pathname === '/customers' || location.pathname.startsWith('/customers/view') || location.pathname.startsWith('/customers/edit');
    }
    if (path === '/resources/list') {
      return location.pathname === '/resources/list' || location.pathname.startsWith('/resources/view') || location.pathname.startsWith('/resources/edit');
    }
    return location.pathname.startsWith(path);
  };

  const getParentClass = (menuName) => {
    const isActive = openMenus[menuName];
    return `flex items-center justify-between px-6 py-3 cursor-pointer transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'bg-gray-50 dark:bg-gray-800/50 font-semibold' : ''}`;
  };

  const getSubLinkClass = (path, exact = false) => {
    const isActive = isRouteActive(path, exact);
    return `flex items-center pl-14 pr-6 py-2.5 transition-colors text-sm ${
      isActive
        ? 'font-medium bg-[#eef2ff] dark:bg-[#4361ee]/10 text-[#4361ee] dark:text-[#4a6cf7] border-r-4 border-[#4361ee]'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 border-r-4 border-transparent'
    }`;
  };

  const getSingleLinkClass = (path, exact = false) => {
    const isActive = isRouteActive(path, exact);
    return `flex items-center px-6 py-3 transition-colors ${
      isActive
        ? 'font-medium bg-[#eef2ff] dark:bg-[#4361ee]/10 text-[#4361ee] dark:text-[#4a6cf7] border-l-4 border-[#4361ee]'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 border-l-4 border-transparent'
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
            
            {/* Dashboard (Standalone) */}
            <li>
              <NavLink to="/dashboard" onClick={closeSidebar} className={getSingleLinkClass('/dashboard', true)}>
                <MdDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </NavLink>
            </li>

            {/* Customers (Collapsible) */}
            <li>
              <div onClick={() => toggleMenu('customers')} className={getParentClass('customers')}>
                <div className="flex items-center">
                  <MdPeople className="w-5 h-5 mr-3 text-[#4361ee]" />
                  <span>Customers</span>
                </div>
                {openMenus.customers ? <MdKeyboardArrowDown className="w-5 h-5" /> : <MdKeyboardArrowRight className="w-5 h-5" />}
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus.customers ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="py-1">
                  <li>
                    <NavLink to="/customers" onClick={closeSidebar} className={getSubLinkClass('/customers')}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-3"></span>
                      Customer List
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/customers/add" onClick={closeSidebar} className={getSubLinkClass('/customers/add', true)}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-3"></span>
                      Add Customer
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/renewals" onClick={closeSidebar} className={getSubLinkClass('/renewals', true)}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-3"></span>
                      Renewals
                    </NavLink>
                  </li>
                </ul>
              </div>
            </li>

            {/* Resources (Collapsible) */}
            <li>
              <div onClick={() => toggleMenu('resources')} className={getParentClass('resources')}>
                <div className="flex items-center">
                  <MdAddBox className="w-5 h-5 mr-3 text-[#4361ee]" />
                  <span>Resources</span>
                </div>
                {openMenus.resources ? <MdKeyboardArrowDown className="w-5 h-5" /> : <MdKeyboardArrowRight className="w-5 h-5" />}
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus.resources ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="py-1">
                  <li>
                    <NavLink to="/resources/add" onClick={closeSidebar} className={getSubLinkClass('/resources/add', true)}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-3"></span>
                      Add Resource
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/resources/list" onClick={closeSidebar} className={getSubLinkClass('/resources/list')}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-3"></span>
                      Resource List
                    </NavLink>
                  </li>
                </ul>
              </div>
            </li>

            {/* Device Management (Collapsible) */}
            <li>
              <div onClick={() => toggleMenu('devices')} className={getParentClass('devices')}>
                <div className="flex items-center">
                  <MdDirectionsCar className="w-5 h-5 mr-3 text-[#4361ee]" />
                  <span>Device Management</span>
                </div>
                {openMenus.devices ? <MdKeyboardArrowDown className="w-5 h-5" /> : <MdKeyboardArrowRight className="w-5 h-5" />}
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus.devices ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="py-1">

                  <li>
                    <NavLink to="/devices/vehicle-types" onClick={closeSidebar} className={getSubLinkClass('/devices/vehicle-types', true)}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-3"></span>
                      Vehicle Types
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/devices/device-models" onClick={closeSidebar} className={getSubLinkClass('/devices/device-models', true)}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-3"></span>
                      Device Models
                    </NavLink>
                  </li>

                </ul>
              </div>
            </li>

            {/* Master Settings (Collapsible) */}
            <li>
              <div onClick={() => toggleMenu('master')} className={getParentClass('master')}>
                <div className="flex items-center">
                  <MdSettings className="w-5 h-5 mr-3 text-[#4361ee]" />
                  <span>Master Settings</span>
                </div>
                {openMenus.master ? <MdKeyboardArrowDown className="w-5 h-5" /> : <MdKeyboardArrowRight className="w-5 h-5" />}
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus.master ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="py-1">
                  <li>
                    <NavLink to="/settings" onClick={closeSidebar} className={getSubLinkClass('/settings', true)}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-3"></span>
                      Settings
                    </NavLink>
                  </li>
                </ul>
              </div>
            </li>

          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
