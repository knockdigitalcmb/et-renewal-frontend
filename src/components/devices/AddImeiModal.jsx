import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCustomer } from '../../context/CustomerContext';
import { useImei } from '../../context/ImeiContext';
import { useDeviceModel } from '../../context/DeviceModelContext';

const AddImeiModal = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      status: 'Active'
    }
  });

  const { customers } = useCustomer();
  const { addImei, imeis } = useImei();
  const { deviceModels } = useDeviceModel();
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      reset({ status: 'Active' });
      setSubmitError('');
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      
      const imeiStr = data.imeiNumber.trim();
      let isDuplicate = false;
      
      // Global Unique Check against SimContext... Wait, ImeiContext!
      // Check legacy vehicles
      for (const cust of customers) {
        if (cust.vehicles) {
          for (const v of cust.vehicles) {
            if (v.imei === imeiStr) {
              isDuplicate = true;
              break;
            }
          }
        }
        if (isDuplicate) break;
      }

      // Check ImeiContext
      if (!isDuplicate && imeis.some(i => i.imei === imeiStr)) {
        isDuplicate = true;
      }
      
      if (isDuplicate) {
        setSubmitError('This IMEI Number is already assigned.');
        return;
      }

      const cust = customers.find(c => c.id === data.customerId);
      const imeiData = {
        imei: imeiStr,
        deviceModel: data.deviceModel,
        customerId: data.customerId,
        customerName: cust ? cust.name : 'Unknown',
        vehicleNumber: 'Unassigned', // Assuming we don't pick vehicle directly here per instructions
        status: data.status
      };
      
      await addImei(imeiData);
      onClose(true); // true indicates success
    } catch (err) {
      setSubmitError(err.message || 'Failed to add IMEI Number');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[600px] flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add IMEI Number</h2>
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
          <form id="add-imei-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IMEI Number *</label>
              <input 
                type="text" 
                {...register('imeiNumber', { 
                  required: 'IMEI Number is required',
                  pattern: { value: /^\d{15}$/, message: 'Must be exactly 15 digits' }
                })} 
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter 15 digit IMEI number"
                maxLength={15}
              />
              {errors.imeiNumber && <p className="text-red-500 text-xs mt-1">{errors.imeiNumber.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Model *</label>
              <select 
                {...register('deviceModel', { required: 'Device Model is required' })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Device Model</option>
                {deviceModels.map(dm => (
                  <option key={dm.id} value={dm.name}>{dm.name}</option>
                ))}
              </select>
              {errors.deviceModel && <p className="text-red-500 text-xs mt-1">{errors.deviceModel.message}</p>}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
              <select 
                {...register('status', { required: 'Status is required' })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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
            form="add-imei-form"
            className="px-4 py-2 bg-[#4361ee] text-white rounded font-medium hover:bg-[#3b55d1] transition-colors"
          >
            Save IMEI
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddImeiModal;
