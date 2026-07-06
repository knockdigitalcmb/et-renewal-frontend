import React, { createContext, useContext, useState } from 'react';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  // Read the real user object written by Login
  const getInitialProfile = () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        return {
          fullName: parsed.fullName || parsed.name || '',
          role: parsed.role || '',
          email: parsed.email || '',
          mobileNumber: parsed.mobileNumber || parsed.phone || '',
          profileImage: parsed.profileImage || null,
          accountCreatedDate: parsed.createdAt || parsed.accountCreatedDate || '',
        };
      }
    } catch (e) {
      console.error('Error loading user profile', e);
    }
    return {
      fullName: '',
      role: '',
      email: '',
      mobileNumber: '',
      profileImage: null,
      accountCreatedDate: '',
    };
  };

  const [profile, setProfile] = useState(getInitialProfile);

  const updateProfile = (newProfile) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
  };

  const clearSession = () => {
    // Session cleared via logout — handled by ProtectedRoute / auth flow
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, clearSession }}>
      {children}
    </ProfileContext.Provider>
  );
};
