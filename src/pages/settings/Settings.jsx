import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { useModal } from '../../context/ModalContext';
import { useSettings } from '../../context/SettingsContext';

const Settings = () => {
  const { showModal } = useModal();
  const { settings, saveSettings, updateTheme } = useSettings();
  
  // Local state for the form, initialized from context
  const [localSettings, setLocalSettings] = useState({ ...settings });

  // Update local state if context changes externally
  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'theme') {
      setLocalSettings(prev => ({ ...prev, theme: value }));
      // Apply theme change immediately for preview
      updateTheme(value);
    } else if (name.startsWith('notify_')) {
      const key = name.replace('notify_', '');
      setLocalSettings(prev => ({
        ...prev,
        notifications: { ...prev.notifications, [key]: checked }
      }));
    } else if (name.startsWith('pref_')) {
      const key = name.replace('pref_', '');
      setLocalSettings(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [key]: value }
      }));
    }
  };

  const handleSave = () => {
    saveSettings(localSettings);
    showModal({ 
      type: 'success', 
      title: 'Settings Updated', 
      message: 'Your notification and system settings have been saved successfully.',
      buttons: [{ text: 'OK', style: 'primary' }]
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200">
      <Header />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>
        
        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Theme Settings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Customize the appearance of your dashboard.</p>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="theme" 
                  value="light"
                  checked={localSettings.theme === 'light'}
                  onChange={handleChange}
                  className="form-radio text-[#4a6cf7] dark:bg-gray-700 dark:border-gray-600" 
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Light Mode</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="theme" 
                  value="dark"
                  checked={localSettings.theme === 'dark'}
                  onChange={handleChange}
                  className="form-radio text-[#4a6cf7] dark:bg-gray-700 dark:border-gray-600" 
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
              </label>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Notification Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {localSettings.notifications?.email ? 'Email notifications enabled' : 'Email notifications disabled'}
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  name="notify_email"
                  checked={localSettings.notifications?.email || false}
                  onChange={handleChange}
                  className="form-checkbox text-[#4a6cf7] dark:bg-gray-700 dark:border-gray-600 rounded h-5 w-5" 
                />
              </label>
              <div className="border-t border-gray-50 dark:border-gray-700"></div>
              
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SMS Alerts</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {localSettings.notifications?.sms ? 'SMS alerts enabled' : 'SMS alerts disabled'}
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  name="notify_sms"
                  checked={localSettings.notifications?.sms || false}
                  onChange={handleChange}
                  className="form-checkbox text-[#4a6cf7] dark:bg-gray-700 dark:border-gray-600 rounded h-5 w-5" 
                />
              </label>
              <div className="border-t border-gray-50 dark:border-gray-700"></div>
              
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp Alerts</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {localSettings.notifications?.whatsapp ? 'WhatsApp alerts enabled' : 'WhatsApp alerts disabled'}
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  name="notify_whatsapp"
                  checked={localSettings.notifications?.whatsapp || false}
                  onChange={handleChange}
                  className="form-checkbox text-[#4a6cf7] dark:bg-gray-700 dark:border-gray-600 rounded h-5 w-5" 
                />
              </label>
              <div className="border-t border-gray-50 dark:border-gray-700"></div>
              
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Renewal Reminders</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {localSettings.notifications?.renewals ? 'Renewal reminders enabled' : 'Renewal reminders disabled'}
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  name="notify_renewals"
                  checked={localSettings.notifications?.renewals || false}
                  onChange={handleChange}
                  className="form-checkbox text-[#4a6cf7] dark:bg-gray-700 dark:border-gray-600 rounded h-5 w-5" 
                />
              </label>
            </div>
          </div>

          {/* System Preferences */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">System Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                <select 
                  name="pref_timezone"
                  value={localSettings.preferences?.timezone || ''}
                  onChange={handleChange}
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:border-[#4a6cf7] focus:ring focus:ring-[#4a6cf7] focus:ring-opacity-50 text-sm p-2.5 border"
                >
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Format</label>
                <select 
                  name="pref_dateFormat"
                  value={localSettings.preferences?.dateFormat || ''}
                  onChange={handleChange}
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:border-[#4a6cf7] focus:ring focus:ring-[#4a6cf7] focus:ring-opacity-50 text-sm p-2.5 border"
                >
                  <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                  <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 pb-12">
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#4a6cf7] text-white rounded font-medium hover:bg-[#3a5bd9] transition-colors shadow-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

