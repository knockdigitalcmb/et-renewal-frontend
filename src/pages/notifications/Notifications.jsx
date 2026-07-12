import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';


const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, loadMoreNotifications, hasMore } = useNotification();
  const navigate = useNavigate();

  const handleNotificationClick = (notificationData) => {
    markAsRead(notificationData.id);
    // console.log(notificationData.link);
    if (notificationData.link) {
      if (notificationData.link_description === 'customer import') {
        window.open(notificationData.link, '_blank');
      } else {
        navigate(notificationData.link);
      }
    }

  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage your recent activities.</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-[#4a6cf7] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex gap-4 p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${notification.is_read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
            >
              <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${notification.bg}`}>
                {notification.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {notification.title}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {notification.time}
                  </span>
                </div>
                <p className="text-base text-gray-600 dark:text-gray-300">
                  {notification.message}
                </p>
              </div>
              {!notification.is_read && (
                <div className="shrink-0 flex items-center pl-2">
                  <div className="w-3 h-3 bg-[#4a6cf7] rounded-full shadow-sm"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        {hasMore && notifications.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-center">
            <button
              onClick={loadMoreNotifications}
              className="px-6 py-2 bg-blue-50 hover:bg-blue-100 text-[#4a6cf7] dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 font-medium rounded-lg transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
