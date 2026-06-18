import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatGlobalDate } from '../utils/dateUtils';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const defaultSettings = {
    theme: 'light',
    notifications: {
      email: true,
      sms: false,
      whatsapp: false,
      renewals: true,
    },
    preferences: {
      timezone: 'Asia/Kolkata (IST)',
      dateFormat: 'DD-MM-YYYY',
    }
  };

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('appSettings');
      if (saved) {
        // Merge with defaults to ensure new settings (like whatsapp) are present
        const parsed = JSON.parse(saved);
        return {
          theme: parsed.theme || defaultSettings.theme,
          notifications: { ...defaultSettings.notifications, ...parsed.notifications },
          preferences: { ...defaultSettings.preferences, ...parsed.preferences }
        };
      }
    } catch (e) {
      console.error("Error loading settings", e);
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Apply dark mode class to html element
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
  };

  const updateTheme = (theme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const formatDate = (dateString) => {
    return formatGlobalDate(dateString, settings.preferences.dateFormat);
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings, updateTheme, formatDate }}>
      {children}
    </SettingsContext.Provider>
  );
};
