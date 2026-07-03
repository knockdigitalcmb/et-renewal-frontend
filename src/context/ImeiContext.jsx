import React, { createContext, useContext, useState } from 'react';

const ImeiContext = createContext();

export const useImei = () => useContext(ImeiContext);

export const ImeiProvider = ({ children }) => {
  const [imeis, setImeis] = useState([]);

  const addImei = (imeiData) => {
    return new Promise((resolve, reject) => {
      const newImei = {
        id: Date.now().toString(),
        ...imeiData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setImeis(prev => [newImei, ...prev]);
      resolve({ success: true, imei: newImei });
    });
  };

  const updateImei = (id, imeiData) => {
    return new Promise((resolve, reject) => {
      setImeis(prev => prev.map(s => s.id === id ? { ...s, ...imeiData, updatedAt: new Date().toISOString() } : s));
      resolve({ success: true });
    });
  };

  const deleteImei = (id) => {
    setImeis(prev => prev.filter(s => s.id !== id));
  };

  return (
    <ImeiContext.Provider value={{ imeis, addImei, updateImei, deleteImei }}>
      {children}
    </ImeiContext.Provider>
  );
};
