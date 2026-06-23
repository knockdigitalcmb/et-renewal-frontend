import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCustomer } from '../../context/CustomerContext';
import { useSim } from '../../context/SimContext';

const EditSIMModal = ({ isOpen, onClose, editData }) => {
  const { register, handleSubmit, control, watch, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      status: 'Active'
    }
  });

  const { customers } = useCustomer();
  const { addSim, updateSim } = useSim();
  const [submitError, setSubmitError] = useState('');
  
  const selectedCustomerId = watch('customerId');
  const [customerVehicles, setCustomerVehicles] = useState([]);

  useEffect(() => {
    if (selectedCustomerId) {
      const cust = customers.find(c => c.id === selectedCustomerId);
      if (cust && cust.vehicles) {
        setCustomerVehicles(cust.vehicles);
        if (cust.vehicles.length === 1) {
          setValue('vehicleNumber', cust.vehicles[0].vehicleNo);
        } else {
          setValue('vehicleNumber', '');
        }
      } else {
        setCustomerVehicles([]);
        setValue('vehicleNumber', '');
      }
    } else {
      setCustomerVehicles([]);
      setValue('vehicleNumber', '');
    }
  }, [selectedCustomerId, customers, setValue]);

  useEffect(() => {
    if (!isOpen) {
      reset({ status: 'Active' });
      setSubmitError('');
    } else if (editData) {
      reset({
        simNumber: editData.simNumber,
        provider: editData.provider !== 'N/A' ? editData.provider : '',
        customerId: editData.customerId,
        vehicleNumber: editData.vehicleNo || '',
        status: editData.status || 'Active'
      });
    }
  }, [isOpen, reset, editData]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      
      // Global Unique Check ONLY if SIM number changed
      const simStr = data.simNumber.trim();
      let isDuplicate = false;
      
      if (!editData || simStr !== editData.simNumber) {
        for (const cust of customers) {
          if (cust.vehicles) {
            for (const v of cust.vehicles) {
              if (v.simNumber === simStr) {
                isDuplicate = true;
                break;
              }
            }
          }
          if (isDuplicate) break;
        }
        
        if (isDuplicate) {
          setSubmitError('This SIM Number is already assigned.');
          return;
        }
      }

      const cust = customers.find(c => c.id === data.customerId);
      const simData = {
        simNumber: simStr,
        provider: data.provider,
        customerId: data.customerId,
        customerName: cust ? cust.name : 'Unknown',
        vehicleNumber: data.vehicleNumber || 'Unassigned',
        status: data.status
      };
      
      if (editData && !editData.isLegacy) {
        await updateSim(editData.id, simData);
      } else {
        await addSim(simData);
      }
      onClose(true); // true indicates success
    } catch (err) {
      setSubmitError(err.message || 'Failed to add SIM Number');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[600px] flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit SIM Number</h2>
          <button onClick={() => onClose(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-sm font-medium">
              {submitError}
            </div>
          )}
          <form id="add-sim-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SIM Number *</label>
              <input 
                type="text" 
                {...register('simNumber', { 
                  required: 'SIM Number is required',
                  pattern: { value: /^[0-9]+$/, message: 'Only digits allowed' }
                })} 
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter 10 or 13 digit SIM number"
              />
              {errors.simNumber && <p className="text-red-500 text-xs mt-1">{errors.simNumber.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SIM Provider *</label>
              <select 
                {...register('provider', { required: 'SIM Provider is required' })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Provider</option>
                <option value="Airtel">Airtel</option>
                <option value="Jio">Jio</option>
                <option value="Vodafone Idea (Vi)">Vodafone Idea (Vi)</option>
                <option value="BSNL">BSNL</option>
                <option value="Other">Other</option>
              </select>
              {errors.provider && <p className="text-red-500 text-xs mt-1">{errors.provider.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
              <select 
                {...register('customerId', { required: 'Customer is required' })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Search / Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.mobile}
                  </option>
                ))}
              </select>
              {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId.message}</p>}
            </div>

            {selectedCustomerId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Number</label>
                <select 
                  {...register('vehicleNumber')}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Vehicle (Optional)</option>
                  {customerVehicles.map(v => (
                    <option key={v.id} value={v.vehicleNo}>
                      {v.vehicleNo}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SIM Status *</label>
              <select 
                {...register('status', { required: 'Status is required' })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
              {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
            </div>

          </form>
        </div>
        
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <button 
            type="button" 
            onClick={() => onClose(false)} 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="add-sim-form"
            className="px-4 py-2 bg-[#4361ee] text-white rounded font-medium hover:bg-[#3b55d1] transition-colors"
          >
            Update SIM Number
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSIMModal;
