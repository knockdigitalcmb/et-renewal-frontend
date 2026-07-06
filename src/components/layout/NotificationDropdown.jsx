import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useNotification();

  if (!isOpen) return null;

  const handleNavigate = (id) => {
    if (id) markAsRead(id);
    onClose();
    navigate('/notifications');
  };

  const handleNavigateAll = () => {
    onClose();
    navigate('/notifications');
  };

  return (
    <div 
      className="absolute bg-white dark:bg-gray-800 rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-gray-700 origin-top-right animate-in fade-in zoom-in duration-200 overflow-y-auto"
      style={{
        top: 'calc(100% + 10px)',
        right: 0,
        width: '380px',
        maxHeight: '500px',
        zIndex: 1000
      }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-10 flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <button 
          onClick={markAllAsRead}
          className="text-sm text-[#4a6cf7] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
        >
          Mark all as read
        </button>
      </div>

      {/* Notification List */}
      <div className="scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
        <div className="divide-y divide-gray-50 dark:divide-gray-700/50 pt-1">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              onClick={() => handleNavigate(notification.id)}
              className={`flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${notification.unread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
            >
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.bg}`}>
                {notification.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {notification.title}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {notification.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-snug">
                  {notification.message}
                </p>
              </div>
              {notification.unread && (
                <div className="shrink-0 mt-1.5">
                  <div className="w-2.5 h-2.5 bg-[#4a6cf7] rounded-full shadow-sm"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-3 text-center bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm sticky bottom-0">
        <button 
          onClick={handleNavigateAll}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#4a6cf7] dark:hover:text-blue-400 font-medium transition-colors"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
