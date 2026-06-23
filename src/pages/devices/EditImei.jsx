import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Header from '../../components/layout/Header';
import { useImei } from '../../context/ImeiContext';
import { useCustomer } from '../../context/CustomerContext';
import { useDeviceModel } from '../../context/DeviceModelContext';
import { useModal } from '../../context/ModalContext';

const EditImei = () => {
  const { imeiId } = useParams();
  const navigate = useNavigate();
  const { imeis, updateImei, addImei } = useImei();
  const { customers } = useCustomer();
  const { deviceModels } = useDeviceModel();
  const { showModal } = useModal();

  const [loading, setLoading] = useState(true);
  const [originalImeiData, setOriginalImeiData] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    let foundImei = imeis.find(i => i.id === imeiId);
    let imeiData = null;

    if (foundImei) {
      imeiData = {
        id: foundImei.id,
        isLegacy: false,
        imeiNumber: foundImei.imei,
        deviceModel: foundImei.deviceModel,
        customerId: foundImei.customerId,
        status: foundImei.status,
      };
    } else {
      for (const cust of customers) {
        if (cust.vehicles) {
          const vehicle = cust.vehicles.find(v => v.id === imeiId);
          if (vehicle && vehicle.imei) {
            imeiData = {
              id: vehicle.id,
              isLegacy: true,
              imeiNumber: vehicle.imei,
              deviceModel: vehicle.deviceModel || '',
              customerId: cust.id,
              status: vehicle.status || 'Active',
            };
            break;
          }
        }
      }
    }

    if (imeiData) {
      setOriginalImeiData(imeiData);
      reset({
        imeiNumber: imeiData.imeiNumber,
        deviceModel: imeiData.deviceModel,
        customerId: imeiData.customerId,
        status: imeiData.status
      });
    }
    setLoading(false);
  }, [imeiId, imeis, customers, reset]);

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      const imeiStr = data.imeiNumber.trim();
      
      // Global Unique Check ONLY if IMEI changed
      let isDuplicate = false;
      if (imeiStr !== originalImeiData.imeiNumber) {
        // Check legacy
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
      }

      const cust = customers.find(c => c.id === data.customerId);
      const updateData = {
        imei: imeiStr,
        deviceModel: data.deviceModel,
        customerId: data.customerId,
        customerName: cust ? cust.name : 'Unknown',
        status: data.status
      };

      if (!originalImeiData.isLegacy) {
        await updateImei(originalImeiData.id, updateData);
      } else {
        // Migrating legacy IMEI to explicit standalone context record
        await addImei(updateData);
      }

      showModal({
        type: 'success',
        title: 'Success',
        message: 'IMEI Number updated successfully',
      });
      navigate('/devices/imei-numbers');

    } catch (err) {
      setSubmitError(err.message || 'Failed to update IMEI Number');
    }
  };

  if (loading) return null;

  if (!originalImeiData) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] dark:bg-gray-900 flex flex-col">
        <Header />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl text-gray-600 dark:text-gray-300">IMEI Number not found</h2>
            <button onClick={() => navigate('/devices/imei-numbers')} className="mt-4 text-[#4361ee] underline">Return to List</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200">
      <Header />
      <main className="flex-1 p-6">
        
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Edit IMEI Number</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Modify IMEI details</p>
            </div>
            <button 
              onClick={() => navigate('/devices/imei-numbers')}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              Cancel
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-8">
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm font-medium border border-red-100 dark:border-red-800/30">
                {submitError}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IMEI Number *</label>
                  <input 
                    type="text" 
                    {...register('imeiNumber', { 
                      required: 'IMEI Number is required',
                      pattern: { value: /^\d{15}$/, message: 'Must be exactly 15 digits' }
                    })} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#4361ee] focus:border-transparent outline-none transition-all"
                    maxLength={15}
                  />
                  {errors.imeiNumber && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.imeiNumber.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Model *</label>
                  <select 
                    {...register('deviceModel', { required: 'Device Model is required' })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#4361ee] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select Device Model</option>
                    {deviceModels.map(dm => (
                      <option key={dm.id} value={dm.name}>{dm.name}</option>
                    ))}
                  </select>
                  {errors.deviceModel && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.deviceModel.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
                  <select 
                    {...register('customerId', { required: 'Customer is required' })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#4361ee] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Search / Select Customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.mobile}
                      </option>
                    ))}
                  </select>
                  {errors.customerId && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.customerId.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                  <select 
                    {...register('status', { required: 'Status is required' })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#4361ee] focus:border-transparent outline-none transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.status.message}</p>}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-[#4361ee] text-white rounded font-medium hover:bg-[#3b55d1] transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditImei;
