import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { useResource } from '../context/ResourceContext';
import Header from '../components/Header';
import { useForm } from 'react-hook-form';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import {
  restrictName, restrictAlphabetsSpaces, restrictNumbers, 
  pasteName, pasteAlphabetsSpaces, pasteNumbers, trimData, regexPatterns
} from '../utils/validationUtils';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomer, updateCustomer, deleteVehicle, checkDuplicateUsername } = useCustomer();
  const { resources } = useResource();
  const activeResources = resources.filter(r => r.status === 'Active');
  
  const [customer, setCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

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
        platform: data.platform || '',
        leadClosureBy: data.leadClosureBy
      });
    } else {
      navigate('/customers');
    }
  }, [id, getCustomer, navigate, reset]);

  const platformWatch = watch('platform') || '';
  const nameWatch = watch('name') || '';

  const isDuplicateUsername = React.useMemo(() => {
    return checkDuplicateUsername(platformWatch, nameWatch, id);
  }, [platformWatch, nameWatch, id, checkDuplicateUsername]);

  const onSubmit = async (data) => {
    const trimmedData = trimData(data);
    if (checkDuplicateUsername(trimmedData.platform, trimmedData.name, id)) {
      alert(`Error: Username "${trimmedData.name}" already exists in platform "${trimmedData.platform}".`);
      return;
    }
    await updateCustomer(id, trimmedData);
    setCustomer({ ...customer, ...trimmedData });
    alert('Owner updated successfully');
  };

  const confirmDelete = (vehicleId) => {
    setVehicleToDelete(vehicleId);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (vehicleToDelete) {
      await deleteVehicle(id, vehicleToDelete);
      setShowModal(false);
      setVehicleToDelete(null);
      setCustomer(getCustomer(id));
    }
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 transition-colors";
    if (fieldName === 'name' && isDuplicateUsername) return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50`;
    if (errors[fieldName]) return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50`;
    if (dirtyFields[fieldName] && !errors[fieldName] && watch(fieldName)) return `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50`;
    return `${baseClass} border-gray-200 focus:border-blue-500 focus:ring-blue-500`;
  };

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">
      <Header />
      <main className="flex-1 p-6">
        <div className="bg-white rounded shadow-sm mx-auto border border-gray-200">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border-b border-gray-100 gap-4">
            <h3 className="text-[1.1rem] font-bold text-gray-800">
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
            <h4 className="text-[1rem] font-bold text-gray-800 mb-4">Edit Owner Details</h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Platform *</label>
                  <select 
                    {...register('platform', { required: 'Platform is required' })}
                    className={getInputClass('platform')}
                  >
                    <option value="">Select Platform</option>
                    <option value="Tracco">Tracco</option>
                    <option value="EagleIndia">EagleIndia</option>
                    <option value="Treckin">Treckin</option>
                    <option value="GPS Monitor">GPS Monitor</option>
                    <option value="Onequik">Onequik</option>
                    <option value="Nowilup">Nowilup</option>
                  </select>
                  {errors.platform && <p className="text-red-500 text-xs mt-1">{errors.platform.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Customer Name *</label>
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
                  {isDuplicateUsername && (
                    <p className="text-red-500 text-xs mt-1">Username already exists in selected platform</p>
                  )}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Mobile Number *</label>
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
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Email</label>
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
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Location *</label>
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

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Alternate Mobile 1</label>
                  <input 
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
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Alternate Mobile 2</label>
                  <input 
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
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Alternate Mobile 3</label>
                  <input 
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
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Lead Closure By</label>
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
                  disabled={Object.keys(errors).length > 0 || isDuplicateUsername}
                  className={`w-full text-white py-2 rounded text-[14px] font-medium transition-colors ${(Object.keys(errors).length > 0 || isDuplicateUsername) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4a6cf7] hover:bg-[#3a5bd9]'}`}
                >
                  Update Owner
                </button>
              </div>
            </form>

            <hr className="my-8 border-gray-200" />

            {/* Manage Vehicles Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <h4 className="text-[1rem] font-bold text-gray-800">Manage Vehicles</h4>
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
                  <tr className="bg-[#f8f9fa] border-t border-b border-gray-100">
                    <th className="p-3 text-[13px] font-semibold text-gray-600">Vehicle Number</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">Device Model</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">IMEI</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">SIM Number</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">Total Payment</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">Pending</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.vehicles && customer.vehicles.length > 0 ? (
                    customer.vehicles.map((vehicle, index) => (
                      <tr key={vehicle.id || index} className="border-b border-gray-100">
                        <td className="p-3 text-[14px] text-gray-700">{vehicle.vehicleNo}</td>
                        <td className="p-3 text-[14px] text-gray-700">{vehicle.deviceModel}</td>
                        <td className="p-3 text-[14px] text-gray-700">{vehicle.imei}</td>
                        <td className="p-3 text-[14px] text-gray-700">{vehicle.simNumber}</td>
                        <td className="p-3 text-[14px] text-gray-700">₹{vehicle.totalPayment}</td>
                        <td className="p-3">
                          {vehicle.pendingAmount <= 0 ? (
                            <span className="bg-[#d4edda] text-[#155724] px-2 py-1 rounded text-[12px] font-medium">
                              Paid
                            </span>
                          ) : (
                            <span className="text-red-500 font-medium text-[14px]">
                              ₹{vehicle.pendingAmount}
                            </span>
                          )}
                        </td>
                        <td className="p-3 flex space-x-2">
                          <button 
                            onClick={() => navigate(`/customers/vehicle/edit/${vehicle.id}`)}
                            className="bg-[#f1c40f] hover:bg-[#f39c12] text-white p-1.5 rounded transition-colors"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(vehicle.id)}
                            className="bg-[#e74c3c] hover:bg-[#c0392b] text-white p-1.5 rounded transition-colors"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-sm text-gray-500">No vehicles found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Vehicle</h3>
            <p className="text-gray-600 mb-6 text-sm">Are you sure you want to delete this vehicle? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-[#e74c3c] text-white rounded text-sm font-medium hover:bg-[#c0392b] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCustomer;
