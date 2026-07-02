import React, { createContext, useContext, useState, useEffect } from 'react';

const DeviceModelContext = createContext();

export const useDeviceModel = () => {
  return useContext(DeviceModelContext);
};

export const DeviceModelProvider = ({ children }) => {
  const [deviceModels, setDeviceModels] = useState([
    { id: crypto.randomUUID(), name: 'GT06N', status: 'Active' },
    { id: crypto.randomUUID(), name: 'AT4', status: 'Active' },
    { id: crypto.randomUUID(), name: 'ET100', status: 'Active' },
    { id: crypto.randomUUID(), name: 'ET200', status: 'Active' },
    { id: crypto.randomUUID(), name: 'Concox', status: 'Active' },
    { id: crypto.randomUUID(), name: 'Teltonika', status: 'Active' },
    { id: crypto.randomUUID(), name: 'Ruptela', status: 'Active' }
  ]);

  const addDeviceModel = (model) => {
    setDeviceModels([...deviceModels, { 
      ...model, 
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]);
  };

  const updateDeviceModel = (id, updatedData) => {
    setDeviceModels(deviceModels.map(dm => 
      dm.id === id ? { ...dm, ...updatedData, updatedAt: new Date().toISOString() } : dm
    ));
  };

  const deleteDeviceModel = (id) => {
    setDeviceModels(deviceModels.filter(dm => dm.id !== id));
  };

  const toggleStatus = (id) => {
    setDeviceModels(deviceModels.map(dm => 
      dm.id === id ? { ...dm, status: dm.status === 'Active' ? 'Inactive' : 'Active' } : dm
    ));
  };

  const checkDuplicateName = (name, excludeId = null) => {
    return deviceModels.some(dm => 
      dm.name.toLowerCase() === name.toLowerCase() && dm.id !== excludeId
    );
  };

  return (
    <DeviceModelContext.Provider value={{ 
      deviceModels, 
      addDeviceModel, 
      updateDeviceModel, 
      deleteDeviceModel,
      toggleStatus,
      checkDuplicateName
    }}>
      {children}
    </DeviceModelContext.Provider>
  );
};
