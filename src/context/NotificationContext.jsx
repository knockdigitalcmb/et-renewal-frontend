import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { FiTool, FiAlertCircle, FiUserPlus, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import { SERVER_BASE_URL } from '../config/api';

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
  const [notifications, setNotifications] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const userId = useMemo(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        return parsed.id || parsed.user_id;
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }
    return null;
  }, []);

  // Helper function to format database notification to frontend format
  const formatNotification = (dbNotification) => {
    let icon = <FiCheckCircle className="w-5 h-5 text-teal-500" />;
    let bg = 'bg-teal-100 dark:bg-teal-900/30';
    let link = "";

    if (dbNotification.type === 'install') {
      icon = <FiTool className="w-5 h-5 text-blue-500" />;
      bg = 'bg-blue-100 dark:bg-blue-900/30';
    } else if (dbNotification.type === 'renewal') {
      icon = <FiAlertCircle className="w-5 h-5 text-yellow-500" />;
      bg = 'bg-yellow-100 dark:bg-yellow-900/30';
    } else if (dbNotification.type === 'customer') {
      icon = <FiUserPlus className="w-5 h-5 text-green-500" />;
      bg = 'bg-green-100 dark:bg-green-900/30';
    } else if (dbNotification.type === 'payment') {
      icon = <FiDollarSign className="w-5 h-5 text-purple-500" />;
      bg = 'bg-purple-100 dark:bg-purple-900/30';
    }

    if (dbNotification.link_description === 'customer') {
      link = '/customers';
    } else if (dbNotification.link_description === 'customer import') {
      console.log(dbNotification.link);
      const fileName = dbNotification.link ? dbNotification.link.split(/[/\\]/).pop() : '';
      link = `${SERVER_BASE_URL}/uploads/errors/${fileName}`;
    }

    const timeStr = dbNotification.created_at
      ? new Date(dbNotification.created_at).toLocaleString()
      : 'Just now';

    return {
      id: dbNotification.id || Date.now(),
      type: dbNotification.type || 'system',
      title: dbNotification.title || 'Notification',
      message: dbNotification.message || '',
      time: timeStr,
      is_read: dbNotification.is_read,
      icon,
      bg,
      link: link,
      link_description: dbNotification.link_description
    };
  };

  const loadMoreNotifications = async () => {
    if (!userId || !hasMore) return;

    try {
      const from = notifications.length;
      const to = from + 29; // Fetch next 30

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        if (data.length < 30) {
          setHasMore(false);
        }
        const formatted = data.map(formatNotification);
        setNotifications(prev => [...prev, ...formatted]);
      }
    } catch (err) {
      console.error('Error fetching more notifications:', err);
    }
  };

  useEffect(() => {
    if (!userId) {
      console.warn('No user_id found in localStorage. Real-time notifications subscription skipped.');
      return;
    }

    // 1. Fetch existing notifications from the database
    const fetchInitialNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(0, 29); // Fetch first 30

        if (error) {
          console.error('Error fetching initial notifications:', error);
          return;
        }

        if (data) {
          if (data.length < 30) {
            setHasMore(false);
          }
          const formatted = data.map(formatNotification);
          setNotifications(formatted);
        }
      } catch (err) {
        console.error('Unexpected error fetching notifications:', err);
      }
    };

    fetchInitialNotifications();

    // 2. Subscribe to Supabase real-time changes for new notifications
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`, // Filter to only receive this user's notifications
        },
        (payload) => {
          // console.log('New notification received via Supabase:', payload.new);
          const newNotification = formatNotification(payload.new);
          // 3. Add to state
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    // 4. Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id) => {
    if (!userId) return;

    // console.log(id, "id");
    // 1. Update in Supabase
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select('*');
    // console.log(data, "data");
    if (error) {
      // console.error('Error marking notification as read:', error);
      return;
    }

    // 2. Update local React state
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, is_read: true } : notification
      )
    );
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    // 1. Bulk update in Supabase
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      // console.error('Error marking all as read:', error);
      return;
    }

    // 2. Update local React state
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, is_read: true }))
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
        hasMore,
        markAsRead,
        markAllAsRead,
        addNotification,
        loadMoreNotifications
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
