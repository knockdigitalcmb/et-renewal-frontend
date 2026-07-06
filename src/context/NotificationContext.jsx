import React, { createContext, useContext, useState } from 'react';
import { FiTool, FiAlertCircle, FiUserPlus, FiDollarSign, FiCheckCircle } from 'react-icons/fi';

const NotificationContext = createContext();

const initialNotifications = [
  {
    id: 1,
    type: 'install',
    title: 'Device Installed',
    message: "Customer Rajesh's GPS device was installed successfully.",
    time: '2 minutes ago',
    unread: true,
    icon: <FiTool className="w-5 h-5 text-blue-500" />,
    bg: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    id: 2,
    type: 'renewal',
    title: 'Renewal Due',
    message: 'Vehicle TN38AB1234 renewal expires tomorrow.',
    time: '15 minutes ago',
    unread: true,
    icon: <FiAlertCircle className="w-5 h-5 text-yellow-500" />,
    bg: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
  {
    id: 3,
    type: 'customer',
    title: 'Customer Added',
    message: 'New customer Arun has been added.',
    time: 'Today',
    unread: true,
    icon: <FiUserPlus className="w-5 h-5 text-green-500" />,
    bg: 'bg-green-100 dark:bg-green-900/30'
  },
  {
    id: 4,
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of ₹2,500 received from Kumar.',
    time: 'Yesterday',
    unread: true,
    icon: <FiDollarSign className="w-5 h-5 text-purple-500" />,
    bg: 'bg-purple-100 dark:bg-purple-900/30'
  },
  {
    id: 5,
    type: 'system',
    title: 'Import Completed',
    message: 'Customer import completed successfully.',
    time: 'Yesterday',
    unread: true,
    icon: <FiCheckCircle className="w-5 h-5 text-teal-500" />,
    bg: 'bg-teal-100 dark:bg-teal-900/30'
  },
  {
    id: 6,
    type: 'install',
    title: 'Device Installed',
    message: "Customer Suresh's GPS device was installed successfully.",
    time: '2 days ago',
    unread: false,
    icon: <FiTool className="w-5 h-5 text-blue-500" />,
    bg: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    id: 7,
    type: 'renewal',
    title: 'Renewal Expired',
    message: 'Vehicle KL01CD5678 renewal expired.',
    time: '3 days ago',
    unread: false,
    icon: <FiAlertCircle className="w-5 h-5 text-red-500" />,
    bg: 'bg-red-100 dark:bg-red-900/30'
  },
  {
    id: 8,
    type: 'payment',
    title: 'Payment Pending',
    message: 'Payment of ₹1,500 pending from Ramesh.',
    time: '4 days ago',
    unread: false,
    icon: <FiDollarSign className="w-5 h-5 text-purple-500" />,
    bg: 'bg-purple-100 dark:bg-purple-900/30'
  }
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, unread: false } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const addNotification = (notification) => {
    setNotifications(prev => [
      {
        ...notification,
        id: Date.now(),
        unread: true,
        time: 'Just now'
      },
      ...prev
    ]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
