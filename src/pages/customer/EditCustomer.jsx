import NumericInput from '../../components/common/NumericInput';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../../context/CustomerContext';
import { useResource } from '../../context/ResourceContext';
import { useModal } from '../../context/ModalContext';
import Header from '../../components/layout/Header';
import { useForm } from 'react-hook-form';
import { FiEdit2, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import {
  restrictName, restrictAlphabetsSpaces, restrictNumbers, 
  pasteName, pasteAlphabetsSpaces, pasteNumbers, trimData, regexPatterns
} from '../../utils/validationUtils';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomer, updateCustomer, deleteVehicle } = useCustomer();
  const { resources } = useResource();
  const { showModal } = useModal();
  const activeResources = resources.filter(r => r.status === 'Active');
  
  const [customer, setCustomer] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors, dirtyFields } } = useForm({
    mode: 'onChange'
  });

  const currentClosureBy = watch('leadClosureBy');
  const hasInactiveSelected = currentClosureBy && !activeResources.some(r => r.employeeName === currentClosureBy);

  useEffect(() => {
    const data = getCustomer(id);
    if (data) {
      setCustomer(data);
      reset({
        name: data.name,
        mobile: data.mobile,
        altMobile1: data.altMobile1 || '',
        altMobile2: data.altMobile2 || '',
        altMobile3: data.altMobile3 || '',
        email: data.email,
        location: data.location,
        leadClosureBy: data.leadClosureBy
      });
    } else {
      navigate('/customers');
    }
  }, [id, getCustomer, navigate, reset]);

  const onSubmit = async (data) => {
    const trimmedData = trimData(data);
    await updateCustomer(id, trimmedData);
    setCustomer({ ...customer, ...trimmedData });
    showModal({ type: 'success', title: 'Success', message: 'Owner updated successfully' });
  };

  const confirmDelete = (vehicleId) => {
    showModal({
      type: 'confirm',
      title: 'Delete Confirmation',
      message: 'Are you sure you want to delete this vehicle? This action cannot be undone.',
      buttons: [
        { text: 'Cancel', style: 'secondary' },
        { 
          text: 'Delete', 
          style: 'danger', 
          onClick: async () => {
            await deleteVehicle(id, vehicleId);
            setCustomer(getCustomer(id));
          }
        }
      ]
    });
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200";
    if (errors[fieldName]) return `${baseClass} border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20`;
    if (dirtyFields[fieldName] && !errors[fieldName] && watch(fieldName)) return `${baseClass} border-green-500 dark:border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20`;
    return `${baseClass} border-gray-200 focus:border-blue-500 focus:ring-blue-500`;
  };

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200">
      <Header />
      <main className="flex-1 p-6">
        <div className="bg-white dark:bg-gray-800 rounded shadow-sm mx-auto border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border-b border-gray-100 dark:border-gray-700 gap-4">
            <h3 className="text-[1.1rem] font-bold text-gray-800 dark:text-white">
              Edit Customer: {customer.name}
            </h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
              <button 
                onClick={() => navigate(`/customers/view/${id}`)}
                className="w-full sm:w-auto bg-[#3498db] text-white px-4 py-2 text-sm font-medium hover:bg-[#2980b9] transition-colors rounded text-center"
              >
                View Details
              </button>
              <button 
                onClick={() => navigate('/customers')}
                className="w-full sm:w-auto bg-[#4a6cf7] text-white px-4 py-2 text-sm font-medium hover:bg-[#3a5bd9] transition-colors rounded text-center"
              >
                Back to List
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Edit Owner Details Section */}
            <h4 className="text-[1rem] font-bold text-gray-800 dark:text-gray-200 mb-4">Edit Owner Details</h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
                  <input 
                    {...register('name', { 
                      required: 'Customer Name is required',
                      minLength: { value: 3, message: 'Minimum 3 characters' },
                      pattern: { value: regexPatterns.customerName, message: 'Invalid characters' }
                    })}
                    onKeyDown={restrictName}
                    onPaste={pasteName}
                    className={getInputClass('name')}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Mobile Number *</label>
                  <input 
                    {...register('mobile', { 
                      required: 'Mobile Number is required',
                      pattern: { value: regexPatterns.mobile, message: 'Must be exactly 10 digits' }
                    })}
                    onKeyDown={restrictNumbers}
                    onPaste={pasteNumbers}
                    className={getInputClass('mobile')}
                  />
                  {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input 
                    {...register('email', {
                      pattern: { value: /^\S+@\S+\.\S+$/i, message: 'Invalid email format' }
                    })}
                    type="email"
                    className={getInputClass('email')}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                  <input 
                    {...register('location', { 
                      required: 'Location is required',
                      pattern: { value: regexPatterns.location, message: 'Only alphabets and spaces allowed' }
                    })}
                    onKeyDown={restrictAlphabetsSpaces}
                    onPaste={pasteAlphabetsSpaces}
                    className={getInputClass('location')}
                  />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Alternate Mobile 1</label>
                  <NumericInput  
                    {...register('altMobile1', { 
                      pattern: { value: regexPatterns.mobile, message: 'Must be exactly 10 digits' },
                      validate: (value) => !value || value !== watch('mobile') || 'Cannot match Primary Mobile'
                    })}
                    onKeyDown={restrictNumbers}
                    onPaste={pasteNumbers}
                    className={getInputClass('altMobile1')}
                  />
                  {errors.altMobile1 && <p className="text-red-500 text-xs mt-1">{errors.altMobile1.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Alternate Mobile 2</label>
                  <NumericInput  
                    {...register('altMobile2', { 
                      pattern: { value: regexPatterns.mobile, message: 'Must be exactly 10 digits' },
                      validate: (value) => {
                        if (!value) return true;
                        if (value === watch('mobile')) return 'Cannot match Primary Mobile';
                        if (value === watch('altMobile1')) return 'Cannot match Alternate Mobile 1';
                        return true;
                      }
                    })}
                    onKeyDown={restrictNumbers}
                    onPaste={pasteNumbers}
                    className={getInputClass('altMobile2')}
                  />
                  {errors.altMobile2 && <p className="text-red-500 text-xs mt-1">{errors.altMobile2.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Alternate Mobile 3</label>
                  <NumericInput  
                    {...register('altMobile3', { 
                      pattern: { value: regexPatterns.mobile, message: 'Must be exactly 10 digits' },
                      validate: (value) => {
                        if (!value) return true;
                        if (value === watch('mobile')) return 'Cannot match Primary Mobile';
                        if (value === watch('altMobile1')) return 'Cannot match Alternate Mobile 1';
                        if (value === watch('altMobile2')) return 'Cannot match Alternate Mobile 2';
                        return true;
                      }
                    })}
                    onKeyDown={restrictNumbers}
                    onPaste={pasteNumbers}
                    className={getInputClass('altMobile3')}
                  />
                  {errors.altMobile3 && <p className="text-red-500 text-xs mt-1">{errors.altMobile3.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Lead Closure By</label>
                  <select 
                    {...register('leadClosureBy', { required: 'Please select Lead Closure Employee' })}
                    className={getInputClass('leadClosureBy')}
                  >
                    <option value="">Select Employee</option>
                    {hasInactiveSelected && (
                      <option value={currentClosureBy}>{currentClosureBy}</option>
                    )}
                    {activeResources.map(resource => (
                      <option key={resource.id} value={resource.employeeName}>
                        {resource.employeeName}
                      </option>
                    ))}
                  </select>
                  {errors.leadClosureBy && <p className="text-red-500 text-xs mt-1">{errors.leadClosureBy.message}</p>}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={Object.keys(errors).length > 0}
                  className={`w-full text-white py-2 rounded text-[14px] font-medium transition-colors ${Object.keys(errors).length > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4a6cf7] hover:bg-[#3a5bd9]'}`}
                >
                  Update Owner
                </button>
              </div>
            </form>

            <hr className="my-8 border-gray-200 dark:border-gray-700" />

            {/* Manage Vehicles Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <h4 className="text-[1rem] font-bold text-gray-800 dark:text-gray-200">Manage Vehicles</h4>
              <button 
                onClick={() => navigate(`/customers/vehicle/add/${id}`)}
                className="w-full sm:w-auto bg-[#2ecc71] text-white px-4 py-2 rounded text-[13px] font-medium hover:bg-[#27ae60] transition-colors text-center"
              >
                + Add New Vehicle
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] dark:bg-gray-800/50 border-t border-b border-gray-100 dark:border-gray-700">
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Vehicle Number</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Platform</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Device Model</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">IMEI</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">SIM Number</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Total Payment</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Pending</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.vehicles && customer.vehicles.length > 0 ? (
                    customer.vehicles.map((vehicle, index) => (
                      <tr key={vehicle.id || index} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="p-3 text-[14px] text-gray-700 dark:text-gray-300">{vehicle.vehicleNo}</td>
                        <td className="p-3 text-[14px] text-gray-700 dark:text-gray-300">{vehicle.platform || '-'}</td>
                        <td className="p-3 text-[14px] text-gray-700 dark:text-gray-300">{vehicle.deviceModel}</td>
                        <td className="p-3 text-[14px] text-gray-700 dark:text-gray-300">{vehicle.imei}</td>
                        <td className="p-3 text-[14px] text-gray-700 dark:text-gray-300">{vehicle.simNumber}</td>
                        <td className="p-3 text-[14px] text-gray-700 dark:text-gray-300">₹{vehicle.totalPayment}</td>
                        <td className="p-3">
                          {vehicle.pendingAmount <= 0 ? (
                            <span className="bg-[#d4edda] dark:bg-green-900/30 text-[#155724] dark:text-green-400 px-2 py-1 rounded text-[12px] font-medium tracking-wide">
                              Paid
                            </span>
                          ) : (
                            <span className="text-red-500 dark:text-red-400 font-medium text-[14px]">
                              ₹{vehicle.pendingAmount}
                            </span>
                          )}
                        </td>
                        <td className="p-3 flex space-x-2">
                          <div className="relative">
                            <button 
                              onClick={() => navigate(`/customers/renewal/${vehicle.id}`)}
                              className="bg-[#2ecc71] hover:bg-[#27ae60] text-white p-1.5 rounded transition-colors"
                              title="Renew Vehicle"
                            >
                              <FiRefreshCw size={14} />
                            </button>
                            {(() => {
                              if (!vehicle.newExpiryDate) return null;
                              const expiry = new Date(vehicle.newExpiryDate);
                              const now = new Date();
                              const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
                              if (diffDays < 0) {
                                return <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>;
                              } else if (diffDays <= 30) {
                                return <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border border-white"></span>;
                              }
                              return null;
                            })()}
                          </div>
                          <button 
                            onClick={() => navigate(`/customers/vehicle/edit/${vehicle.id}`)}
                            className="bg-[#f1c40f] hover:bg-[#f39c12] text-white p-1.5 rounded transition-colors"
                            title="Edit Vehicle"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(vehicle.id)}
                            className="bg-[#e74c3c] hover:bg-[#c0392b] text-white p-1.5 rounded transition-colors"
                            title="Delete Vehicle"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No vehicles found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default EditCustomer;
