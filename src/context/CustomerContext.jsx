import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerContext = createContext();

export const useCustomer = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [renewals, setRenewals] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);

  const addRenewal = (renewalData) => {
    setRenewals(prev => [{ id: Date.now(), ...renewalData }, ...prev]);
  };

  const addCustomer = async (data) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCustomer = { 
          id: Date.now().toString(), 
          name: data.UserName || data.customerName || 'New Customer',
          mobile: data.mobileNumber || '0000000000',
          altMobile1: data.altMobile1 || '',
          altMobile2: data.altMobile2 || '',
          altMobile3: data.altMobile3 || '',
          email: data.email || '',
          location: data.location || '-',
          leadClosureBy: data.leadClosureBy || '-',
          totalVehicles: 1,
          pendingAmount: data.pendingAmount > 0 ? data.pendingAmount : 0,
          isPaid: data.pendingAmount <= 0,
          renewalDate: data.expiryDate || '-',
          installDate: data.installationDate || '-',
          vehicleNo: data.vehicleNumber || '-',
          vehicles: [{
            id: Date.now().toString() + '-v1',
            vehicleNo: data.vehicleNumber || '-',
            vehicleType: data.vehicleType || '',
            platform: data.platform || '',
            imei: data.imeiNumber || '',
            simNumber: data.simNumber || '',
            deviceModel: data.deviceModel || '',
            devicePrice: data.devicePrice || 0,
            simPrice: data.simPrice || 0,
            totalPayment: data.totalPaymentReceived || 0,
            amountPaid: data.amountPaid || 0,
            pendingAmount: data.pendingAmount > 0 ? data.pendingAmount : 0,
            paymentMode: data.paymentMode || '',
            installPerson: data.installationPerson || '',
            leadClosureBy: data.leadClosureBy || '-',
            installDate: data.installationDate || '-',
            validity: data.validity || '12',
            expiryDate: data.expiryDate || '-'
          }],
          ...data
        };
        setCustomers(prev => [newCustomer, ...prev]);
        setIsLoading(false);
        resolve({ success: true, id: newCustomer.id });
      }, 500);
    });
  };

  const updateCustomer = async (id, data) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setCustomers(prev => prev.map(c => c.id === id.toString() ? { ...c, ...data } : c));
        setIsLoading(false);
        resolve({ success: true });
      }, 500);
    });
  };

  const deleteCustomer = async (id) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setCustomers(prev => prev.filter(c => c.id !== id.toString()));
        setIsLoading(false);
        resolve({ success: true });
      }, 500);
    });
  };

  const getCustomer = (id) => {
    return customers.find(c => c.id === id.toString());
  };

  const getVehicle = (vehicleId) => {
    for (const c of customers) {
      const v = c.vehicles?.find(veh => veh.id === vehicleId.toString());
      if (v) return { ...v, customerId: c.id };
    }
    return null;
  };

  const updateVehicle = async (vehicleId, data) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setCustomers(prev => prev.map(c => {
          const hasVehicle = c.vehicles?.some(v => v.id === vehicleId.toString());
          if (!hasVehicle) return c;
          
          const updatedVehicles = c.vehicles.map(v => 
            v.id === vehicleId.toString() ? { ...v, ...data } : v
          );
          
          return { ...c, vehicles: updatedVehicles };
        }));
        setIsLoading(false);
        resolve({ success: true });
      }, 500);
    });
  };
  
  const deleteVehicle = async (customerId, vehicleId) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setCustomers(prev => prev.map(c => {
          if (c.id === customerId.toString()) {
            return {
              ...c,
              vehicles: c.vehicles.filter(v => v.id !== vehicleId.toString()),
              totalVehicles: c.vehicles.length - 1
            };
          }
          return c;
        }));
        setIsLoading(false);
        resolve({ success: true });
      }, 500);
    });
  };

  const addVehicle = async (customerId, vehicleData) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setCustomers(prev => prev.map(c => {
          if (c.id === customerId.toString()) {
            const newVehicle = {
              id: Date.now().toString(),
              ...vehicleData
            };
            return {
              ...c,
              vehicles: [...(c.vehicles || []), newVehicle],
              totalVehicles: (c.vehicles || []).length + 1
            };
          }
          return c;
        }));
        setIsLoading(false);
        resolve({ success: true });
      }, 500);
    });
  };

  const checkDuplicateVehicle = (field, value, excludeVehicleId = null) => {
    if (!value) return false;
    const lowerValue = value.toLowerCase().trim();
    for (const c of customers) {
      if (c.vehicles) {
        for (const v of c.vehicles) {
          if (v.id === excludeVehicleId) continue;
          if (v[field] && v[field].toLowerCase().trim() === lowerValue) {
            return true;
          }
        }
      }
    }
    return false;
  };

  return (
    <CustomerContext.Provider value={{ 
      customers, 
      renewals, 
      addCustomer, 
      updateCustomer, 
      deleteCustomer, 
      getCustomer, 
      addRenewal, 
      isLoading,
      getVehicle,
      updateVehicle,
      deleteVehicle,
      addVehicle,
      checkDuplicateVehicle
    }}>
      {children}
    </CustomerContext.Provider>
  );
};
