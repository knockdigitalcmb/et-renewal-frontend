import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';

const CustomerContext = createContext();

export const useCustomer = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [platform, setPlatform] = useState([]);
  const [paymentMode, setPaymentMode] = useState([]);
  const [deviceModels, setDeviceModels] = useState([]);
  const [userAll, setUserAll] = useState([]);
  const [renewals, setRenewals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/customers`, {
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
          leadClosureBy: c.devices && c.devices.length > 0 ? (c.devices[0].lead_closer || '-') : '-',
          totalVehicles: c.devices ? c.devices.length : 0,
          pendingAmount: c.devices && c.devices.length > 0 ? (c.devices[0].renewal_payment_status === 0 ? 1 : 0) : 0,
          // isPaid: c.devices && c.devices.length > 0 ? c.devices[0].renewal_payment_status !== 0 : true,
          // renewalDate: c.devices && c.devices.length > 0 && c.devices[0].next_renew_date ? c.devices[0].next_renew_date : '-',
          // installDate: c.devices && c.devices.length > 0 && c.devices[0].installation_date ? c.devices[0].installation_date : '-',
          // vehicleNo: c.devices && c.devices.length > 0 ? (c.devices[0].vehicle_number || '-') : '-',
          // vehicles: c.devices && c.devices.length > 0 ? c.devices.length : '-',
          renewalDate: c.devices && c.devices.length > 0 ? c.devices.map(d => (
            d.next_renew_date || ''
          )).join(', ') : '-',
          platform: c.devices && c.devices.length > 0 ? c.devices.map(d => (
            d.platforms.platform_name || ''
          )).join(', ') : '-',
          vehicles: c.devices ? c.devices.map(d => ({
            id: d.id,
            vehicleNo: d.vehicle_number || '-',
            vehicleType: d.vehicle_type || '',
            platform: d.platforms.platform_name || '',
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

  const fetchPlatform = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/platforms/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const platformList = Array.isArray(result.data) ? result.data : [];
        const mappedPlatform = platformList.map(c => ({
          id: c.id,
          platformName: c.platform_name || '-'
        }));
        setPlatform(mappedPlatform);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPaymentMode = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/payment-modes/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const paymentModeList = Array.isArray(result.data) ? result.data : [];
        const mappedPaymentMode = paymentModeList.map(c => ({
          id: c.id,
          paymentMode: c.payment_mode_name || '-'
        }));
        setPaymentMode(mappedPaymentMode);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDeviceModels = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/device-models/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const deviceList = Array.isArray(result.data) ? result.data : [];
        const mappedDeviceModels = deviceList.map(c => ({
          id: c.id,
          name: c.model_name || '-'
        }));
        // console.log("mappedDeviceModels:", mappedDeviceModels);
        setDeviceModels(mappedDeviceModels);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/users/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const userList = Array.isArray(result.data) ? result.data : [];
        const mappedUserAll = userList.map(c => ({
          id: c.id,
          employeeName: c.name || '-'
        }));
        setUserAll(mappedUserAll);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);



  useEffect(() => {
    fetchCustomers();
    fetchPlatform();
    fetchPaymentMode();
    fetchDeviceModels();
    fetchUserAll();
  }, [fetchCustomers, fetchPlatform, fetchPaymentMode, fetchDeviceModels, fetchUserAll]);

  const getCustomerById = useCallback(async (id) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
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
            vehicleType: d.vehicle_types.vehicle_type_name || '',
            platform: d.platforms.platform_name || '',
            imei: d.imeis.imei_number || '',
            simNumber: d.sims.sim_number || '',
            deviceModel: d.device_models.model_name || '',
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
    try {
      setIsLoading(true);

      const token = localStorage.getItem("accessToken");

      console.log('data', data);

      const financial_devices = {
        "payment_mode": data.paymentMode,
        "transaction_id": data.transactionRefNo,
        "paid_date": data.installationDate,
        "total_sale_amount": data.totalSaleAmount,
        "device_amount": data.deviceCharge,
        "sim_amount": data.simCharge,
        "software_amount": data.softwareCharge,
        "technician_amount": data.technicianCharge,
        "courier_amount": data.courierCharge,
        "total_amount": data.totalAmount,
        "amount_paid": data.amountPaid,
        "pending_amount": data.pendingAmount
      };

      const devices = [];
      if (data.vehicles && data.vehicles.length > 0) {
        for (let i = 0; i < data.vehicles.length; i++) {
          const v = data.vehicles[i];
          devices.push({
            "vehicle_number": v.vehicleNumber,
            "platform": v.platform,
            "vehicle_type": v.vehicleType,
            "imei_number": v.imeiNumber,
            "sim_number": v.simNumber,
            "device_model": v.deviceModel
          });
        }
      }

      const installation_devices = {
        "installation_person": data.installationPerson,
        "lead_closure": data.leadClosureBy,
        "installation_date": data.installationDate,
        "validity": data.validity,
        "expiry_date": data.expiryDate,
      };
      const response =
        await fetch(
          `${API_BASE_URL}/customers`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body:
              JSON.stringify({
                name: data.UserName || data.customerName || 'New Customer',
                phoneNumber: data.mobileNumber,
                phoneNumber1: data.altMobile1 || null,
                phoneNumber2: data.altMobile2 || null,
                phoneNumber3: data.altMobile3 || null,
                email: data.email || "",
                location: data.location || null,
                notes: data.notes || "",
                devices: devices,
                financial_devices: financial_devices,
                installation_devices: installation_devices,
              }),
          }
        );

      const result = await response.json();

      if (result.success) {
        await fetchCustomers();

        return {
          success: true,
        };
      }

      return {
        success: false,
        message: result.message,
      };
    } catch (error) {
      console.error("Create Customer Error:", error);

      return {
        success: false,
        message: "New Customer not created", error
      };
    } finally {
      setIsLoading(false);
    }

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
      platform,
      paymentMode,
      deviceModels,
      userAll,
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
