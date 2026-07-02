import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const defaultProfile = {
    fullName: 'Admin',
    role: 'Administrator',
    email: 'admin@example.com',
    mobileNumber: '9876543210',
    profileImage: null,
    accountCreatedDate: '2024-01-10'
  };

  const [profile, setProfile] = useState(defaultProfile);

  const updateProfile = (newProfile) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
  };

  const clearSession = () => {
    // For now we just clear the auth/session state or perform a basic reset.
    // If we wanted to clear everything, we could do localStorage.clear(), 
    // but we want to retain other CRM data for demo purposes.
    // So we just clear the profile if necessary, or just rely on navigation.
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, clearSession }}>
      {children}
    </ProfileContext.Provider>
  );
};
