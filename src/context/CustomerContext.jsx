import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CustomerContext = createContext();

export const useCustomer = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [renewals, setRenewals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch('http://103.235.105.121:3000/api/v1/customers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const customerList = Array.isArray(result.data) ? result.data : [];
        const mappedCustomers = customerList.map(c => ({
          id: c.id,
          name: c.name || '-',
          mobile: c.phone_number || '-',
          altMobile1: c.phone_number_1 || '',
          altMobile2: c.phone_number_2 || '',
          altMobile3: c.phone_number_3 || '',
          email: c.email || '',
          location: c.location || '-',
          platform: c.devices && c.devices.length > 0 ? (c.devices[0].platform || '-') : '-',
          leadClosureBy: c.devices && c.devices.length > 0 ? (c.devices[0].lead_closer || '-') : '-',
          totalVehicles: c.devices ? c.devices.length : 0,
          pendingAmount: c.devices && c.devices.length > 0 ? (c.devices[0].renewal_payment_status === 0 ? 1 : 0) : 0,
          isPaid: c.devices && c.devices.length > 0 ? c.devices[0].renewal_payment_status !== 0 : true,
          renewalDate: c.devices && c.devices.length > 0 && c.devices[0].next_renew_date ? c.devices[0].next_renew_date : '-',
          installDate: c.devices && c.devices.length > 0 && c.devices[0].installation_date ? c.devices[0].installation_date : '-',
          vehicleNo: c.devices && c.devices.length > 0 ? (c.devices[0].vehicle_number || '-') : '-',
          vehicles: c.devices ? c.devices.map(d => ({
            id: d.id,
            vehicleNo: d.vehicle_number || '-',
            vehicleType: d.vehicle_type || '',
            platform: d.platform || '',
            imei: d.imei || '',
            simNumber: d.sim_number || '',
            deviceModel: d.device_type || '',
            installDate: d.installation_date || '-',
            validity: d.validity || '12',
            expiryDate: d.next_renew_date || '-',
            installPerson: d.install_person || d.installationPerson || '',
            leadClosureBy: d.lead_closer || d.leadClosureBy || '',
            totalAmount: d.total_amount || d.totalAmount || 0,
            totalSaleAmount: d.total_sale_amount || d.totalSaleAmount || d.total_amount || d.totalAmount || 0,
            deviceAmount: d.device_amount || d.deviceAmount || d.deviceCharge || 0,
            simAmount: d.sim_amount || d.simAmount || d.simCharge || 0,
            softwareAmount: d.software_amount || d.softwareAmount || d.softwareCharge || 0,
            technicianAmount: d.technician_amount || d.technicianAmount || d.technicianCharge || 0,
            courierAmount: d.courier_amount || d.courierAmount || d.courierCharge || 0,
            amountPaid: d.amount_paid || d.amountPaid || 0,
            pendingAmount: d.pending_amount || d.pendingAmount || 0,
            paymentMode: d.payment_mode || d.paymentMode || '',
            transactionId: d.transaction_id || d.transactionId || d.transactionRefNo || ''
          })) : []
        }));
        setCustomers(mappedCustomers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const getCustomerById = useCallback(async (id) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`http://103.235.105.121:3000/api/v1/customers/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result) {
        const c = result.data || result;
        return {
          id: c.id,
          name: c.name || '-',
          mobile: c.phone_number || '-',
          altMobile1: c.phone_number_1 || '',
          altMobile2: c.phone_number_2 || '',
          altMobile3: c.phone_number_3 || '',
          email: c.email || '',
          location: c.location || '-',
          platform: c.devices && c.devices.length > 0 ? (c.devices[0].platform || '-') : '-',
          leadClosureBy: c.devices && c.devices.length > 0 ? (c.devices[0].lead_closer || '-') : '-',
          totalVehicles: c.devices ? c.devices.length : 0,
          pendingAmount: c.devices && c.devices.length > 0 ? (c.devices[0].renewal_payment_status === 0 ? 1 : 0) : 0,
          isPaid: c.devices && c.devices.length > 0 ? c.devices[0].renewal_payment_status !== 0 : true,
          renewalDate: c.devices && c.devices.length > 0 && c.devices[0].next_renew_date ? c.devices[0].next_renew_date : '-',
          installDate: c.devices && c.devices.length > 0 && c.devices[0].installation_date ? c.devices[0].installation_date : '-',
          vehicleNo: c.devices && c.devices.length > 0 ? (c.devices[0].vehicle_number || '-') : '-',
          vehicles: c.devices ? c.devices.map(d => ({
            id: d.id,
            vehicleNo: d.vehicle_number || '-',
            vehicleType: d.vehicle_type || '',
            platform: d.platform || '',
            imei: d.imei || '',
            simNumber: d.sim_number || '',
            deviceModel: d.device_type || '',
            installDate: d.installation_date || '-',
            validity: d.validity || '12',
            expiryDate: d.next_renew_date || '-',
            installPerson: d.install_person || d.installationPerson || '',
            leadClosureBy: d.lead_closer || d.leadClosureBy || '',
            totalAmount: d.total_amount || d.totalAmount || 0,
            totalSaleAmount: d.total_sale_amount || d.totalSaleAmount || d.total_amount || d.totalAmount || 0,
            deviceAmount: d.device_amount || d.deviceAmount || d.deviceCharge || 0,
            simAmount: d.sim_amount || d.simAmount || d.simCharge || 0,
            softwareAmount: d.software_amount || d.softwareAmount || d.softwareCharge || 0,
            technicianAmount: d.technician_amount || d.technicianAmount || d.technicianCharge || 0,
            courierAmount: d.courier_amount || d.courierAmount || d.courierCharge || 0,
            amountPaid: d.amount_paid || d.amountPaid || 0,
            pendingAmount: d.pending_amount || d.pendingAmount || 0,
            paymentMode: d.payment_mode || d.paymentMode || '',
            transactionId: d.transaction_id || d.transactionId || d.transactionRefNo || ''
          })) : []
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching customer:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  const addRenewal = (renewalData) => {
    setRenewals(prev => [{ id: Date.now(), ...renewalData }, ...prev]);
  };

  const addCustomer = async (data) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCustomer = {
          ...data,
          id: Date.now().toString(),
          name: data.UserName || data.customerName || 'New Customer',
          mobile: data.mobileNumber || '0000000000',
          altMobile1: data.altMobile1 || '',
          altMobile2: data.altMobile2 || '',
          altMobile3: data.altMobile3 || '',
          email: data.email || '',
          location: data.location || '-',
          platform: data.platform || '',
          leadClosureBy: data.leadClosureBy || '-',
          totalVehicles: data.vehicles ? data.vehicles.length : 1,
          pendingAmount: data.pendingAmount > 0 ? data.pendingAmount : 0,
          isPaid: data.pendingAmount <= 0,
          renewalDate: data.expiryDate || '-',
          installDate: data.installationDate || data.installDate || '-',
          vehicleNo: data.vehicles && data.vehicles.length > 0 ? (data.vehicles[0].vehicleNumber || data.vehicles[0].vehicleNo || '-') : '-',
          vehicles: data.vehicles && data.vehicles.length > 0 ? data.vehicles.map((v, index) => ({
            id: Date.now().toString() + `-v${index + 1}`,
            vehicleNo: v.vehicleNumber || v.vehicleNo || '-',
            vehicleType: v.vehicleType || '',
            platform: v.platform || '',
            imei: v.imeiNumber || v.imei || '',
            simNumber: v.simNumber || '',
            deviceModel: v.deviceModel || '',
            deviceCharge: data.deviceCharge || 0,
            simCharge: data.simCharge || 0,
            softwareCharge: data.softwareCharge || 0,
            technicianCharge: data.technicianCharge || 0,
            courierCharge: data.courierCharge || 0,
            totalAmount: data.totalAmount || 0,
            amountPaid: data.amountPaid || 0,
            pendingAmount: data.pendingAmount > 0 ? data.pendingAmount : 0,
            paymentMode: data.paymentMode || '',
            installPerson: data.installationPerson || data.installPerson || '',
            leadClosureBy: data.leadClosureBy || '-',
            installDate: data.installationDate || data.installDate || '-',
            validity: data.validity || '12',
            expiryDate: data.expiryDate || '-'
          })) : []
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
            v.id === vehicleId.toString() ? {
              ...v,
              ...data,
              vehicleNo: data.vehicleNo || v.vehicleNo || '-',
              imei: data.imei || v.imei || '',
              installDate: data.installDate || data.installationDate || v.installDate || '-',
              validity: data.validity || v.validity || '12',
            } : v
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
              ...vehicleData,
              vehicleNo: vehicleData.vehicleNo || vehicleData.vehicleNumber || '-',
              imei: vehicleData.imei || vehicleData.imeiNumber || '',
              installDate: vehicleData.installDate || vehicleData.installationDate || '-',
              validity: vehicleData.validity || '12',
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

  const checkDuplicateUsername = (platform, username, excludeCustomerId = null) => {
    if (!platform || !username) return false;
    const lowerPlatform = platform.toLowerCase().trim();
    const lowerUsername = username.toLowerCase().trim();

    return customers.some(c =>
      c.platform && c.platform.toLowerCase().trim() === lowerPlatform &&
      c.name && c.name.toLowerCase().trim() === lowerUsername &&
      c.id !== excludeCustomerId?.toString()
    );
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
      fetchCustomers,
      getCustomerById,
      getVehicle,
      updateVehicle,
      deleteVehicle,
      addVehicle,
      checkDuplicateVehicle,
      checkDuplicateUsername
    }}>
      {children}
    </CustomerContext.Provider>
  );
};
