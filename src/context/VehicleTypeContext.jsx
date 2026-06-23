import React, { createContext, useContext, useState, useEffect } from 'react';

const VehicleTypeContext = createContext();

export const useVehicleType = () => useContext(VehicleTypeContext);

export const VehicleTypeProvider = ({ children }) => {
  const [vehicleTypes, setVehicleTypes] = useState(() => {
    const saved = localStorage.getItem('crm_vehicle_types');
    if (saved) {
      return JSON.parse(saved);
    } else {
      // Default initialization
      return [
        { id: 1, name: 'Car', status: 'Active', createdDate: new Date().toISOString().split('T')[0] },
        { id: 2, name: 'Bike', status: 'Active', createdDate: new Date().toISOString().split('T')[0] },
        { id: 3, name: 'Bus', status: 'Active', createdDate: new Date().toISOString().split('T')[0] },
        { id: 4, name: 'Lorry', status: 'Active', createdDate: new Date().toISOString().split('T')[0] },
        { id: 5, name: 'Van', status: 'Active', createdDate: new Date().toISOString().split('T')[0] },
        { id: 6, name: 'Auto', status: 'Active', createdDate: new Date().toISOString().split('T')[0] }
      ];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('crm_vehicle_types', JSON.stringify(vehicleTypes));
  }, [vehicleTypes]);

  const addVehicleType = async (data) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newVehicleType = { 
          id: Date.now(), 
          name: data.name, 
          status: data.status || 'Active', 
          createdDate: new Date().toISOString().split('T')[0] 
        };
        setVehicleTypes(prev => [newVehicleType, ...prev]);
        setIsLoading(false);
        resolve({ success: true });
      }, 300);
    });
  };

  const updateVehicleType = async (id, data) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setVehicleTypes(prev => prev.map(vt => vt.id === parseInt(id) ? { ...vt, ...data } : vt));
        setIsLoading(false);
        resolve({ success: true });
      }, 300);
    });
  };

  const deleteVehicleType = async (id) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setVehicleTypes(prev => prev.filter(vt => vt.id !== parseInt(id)));
        setIsLoading(false);
        resolve({ success: true });
      }, 300);
    });
  };

  const getVehicleType = (id) => {
    return vehicleTypes.find(vt => vt.id === parseInt(id));
  };

  return (
    <VehicleTypeContext.Provider value={{ 
      vehicleTypes, 
      addVehicleType, 
      updateVehicleType, 
      deleteVehicleType, 
      getVehicleType, 
      isLoading 
    }}>
      {children}
    </VehicleTypeContext.Provider>
  );
};
