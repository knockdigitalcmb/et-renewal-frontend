import React, { createContext, useContext, useState, useEffect } from 'react';

const VehicleTypeContext = createContext();

export const useVehicleType = () => useContext(VehicleTypeContext);

export const VehicleTypeProvider = ({ children }) => {
  const defaultTypes = [
    { id: 1, name: 'Car', status: 'Active', createdAt: new Date().toISOString().split('T')[0] },
    { id: 2, name: 'Bike', status: 'Active', createdAt: new Date().toISOString().split('T')[0] },
    { id: 3, name: 'Bus', status: 'Active', createdAt: new Date().toISOString().split('T')[0] },
    { id: 4, name: 'Lorry', status: 'Active', createdAt: new Date().toISOString().split('T')[0] },
    { id: 5, name: 'Van', status: 'Active', createdAt: new Date().toISOString().split('T')[0] },
    { id: 6, name: 'Auto', status: 'Active', createdAt: new Date().toISOString().split('T')[0] },
  ];

  const [vehicleTypes, setVehicleTypes] = useState(() => {
    const saved = localStorage.getItem('crm_vehicle_types');
    return saved ? JSON.parse(saved) : defaultTypes;
  });

  useEffect(() => {
    localStorage.setItem('crm_vehicle_types', JSON.stringify(vehicleTypes));
  }, [vehicleTypes]);

  const [isLoading, setIsLoading] = useState(false);

  const addVehicleType = async (data) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newType = { 
          ...data, 
          id: Date.now(), 
          createdAt: new Date().toISOString().split('T')[0] 
        };
        setVehicleTypes(prev => [newType, ...prev]);
        setIsLoading(false);
        resolve({ success: true });
      }, 300);
    });
  };

  const updateVehicleType = async (id, data) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setVehicleTypes(prev => prev.map(type => type.id === parseInt(id) ? { ...type, ...data } : type));
        setIsLoading(false);
        resolve({ success: true });
      }, 300);
    });
  };

  const deleteVehicleType = async (id) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setVehicleTypes(prev => prev.filter(type => type.id !== parseInt(id)));
        setIsLoading(false);
        resolve({ success: true });
      }, 300);
    });
  };

  const getVehicleType = (id) => {
    return vehicleTypes.find(type => type.id === parseInt(id));
  };

  const checkDuplicateVehicleType = (name, excludeId = null) => {
    const lowerName = name.toLowerCase().trim();
    return vehicleTypes.some(t => t.name.toLowerCase().trim() === lowerName && t.id !== excludeId);
  };

  return (
    <VehicleTypeContext.Provider value={{ 
      vehicleTypes, 
      addVehicleType, 
      updateVehicleType, 
      deleteVehicleType, 
      getVehicleType,
      checkDuplicateVehicleType,
      isLoading 
    }}>
      {children}
    </VehicleTypeContext.Provider>
  );
};
