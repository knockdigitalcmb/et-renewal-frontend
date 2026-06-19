import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLayout } from '../../context/LayoutContext';
import { useModal } from '../../context/ModalContext';
import { useProfile } from '../../context/ProfileContext';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import GlobalSearch from '../common/GlobalSearch';

const Header = () => {
  const navigate = useNavigate();
  const { toggleSidebar } = useLayout();
  const { showModal } = useModal();
  const { profile, clearSession } = useProfile();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const username = profile.fullName || "Admin";
  const initial = username.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    showModal({
      type: 'confirm',
      title: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        { text: 'Cancel', style: 'secondary' },
        { 
          text: 'Logout', 
          style: 'danger', 
          onClick: () => {
            clearSession();
            navigate('/login');
          }
        }
      ]
    });
  };

  const HamburgerButton = () => (
    <button 
      onClick={toggleSidebar}
      className="md:hidden mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );

  return (
    <>
      <header className="bg-white dark:bg-gray-800 min-h-[72px] py-3 md:py-0 flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-8 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 gap-y-3">
        {/* Left: Welcome Text */}
        <div className="flex items-center w-auto md:w-1/3 order-1">
          <HamburgerButton />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap">Welcome, {username}</h2>
        </div>
        
        {/* Center: Global Search */}
        <div className="w-full md:w-1/3 flex justify-center order-3 md:order-2">
          <GlobalSearch />
        </div>
        
        {/* Right: Profile */}
        <div className="flex items-center justify-end w-auto md:w-1/3 order-2 md:order-3">
          <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded-full md:rounded-lg transition-colors"
          >
            {profile.profileImage ? (
              <img src={profile.profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-600" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#4a6cf7] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {initial}
              </div>
            )}
            <span className="hidden md:block font-semibold text-gray-700 dark:text-gray-200 pr-2">{username}</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 md:hidden">
                <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{username}</p>
              </div>
              
              <button 
                onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiUser className="mr-3 text-gray-400 dark:text-gray-500" size={16} />
                Profile
              </button>
              
              <button 
                onClick={() => { setIsDropdownOpen(false); navigate('/settings'); }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiSettings className="mr-3 text-gray-400 dark:text-gray-500" size={16} />
                Settings
              </button>
              
              <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
              
              <button 
                onClick={handleLogoutClick}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <FiLogOut className="mr-3 text-red-500 dark:text-red-400" size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      </header>

    </>
  );
};

export default Header;
