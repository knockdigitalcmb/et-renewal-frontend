import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import { useVehicleType } from '../context/VehicleTypeContext';
import { useForm } from 'react-hook-form';
import { FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const VehicleTypeMaster = () => {
  const { vehicleTypes, addVehicleType, updateVehicleType, deleteVehicleType, checkDuplicateVehicleType, isLoading } = useVehicleType();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { name: '', status: 'Active' }
  });

  const nameWatch = watch('name');
  
  const isDuplicate = useMemo(() => {
    return nameWatch && checkDuplicateVehicleType(nameWatch, editingId);
  }, [nameWatch, editingId, checkDuplicateVehicleType]);

  const filteredTypes = useMemo(() => {
    if (!searchTerm) return vehicleTypes;
    return vehicleTypes.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [vehicleTypes, searchTerm]);

  const onSubmit = async (data) => {
    if (isDuplicate) return;

    if (editingId) {
      await updateVehicleType(editingId, data);
      alert('Vehicle type updated successfully.');
    } else {
      await addVehicleType(data);
      alert('Vehicle type added successfully.');
    }
    handleReset();
  };

  const handleEdit = (type) => {
    setEditingId(type.id);
    reset({ name: type.name, status: type.status });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle type?")) {
      await deleteVehicleType(id);
    }
  };

  const handleReset = () => {
    setEditingId(null);
    reset({ name: '', status: 'Active' });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="flex justify-between items-center mb-6 bg-white p-5 rounded border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800">Vehicle Type Master</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form Section */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  {editingId ? 'Edit Vehicle Type' : 'Add Vehicle Type'}
                </h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Vehicle Type Name *</label>
                    <input 
                      {...register('name', { required: 'Name is required' })}
                      className={`w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 transition-colors ${
                        (errors.name || isDuplicate) ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="e.g. Car, Truck"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    {isDuplicate && <p className="text-red-500 text-xs mt-1">This vehicle type already exists.</p>}
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Status *</label>
                    <select 
                      {...register('status', { required: 'Status is required' })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button 
                      type="submit" 
                      disabled={isLoading || isDuplicate || !nameWatch}
                      className={`flex-1 text-white py-2 rounded text-[14px] font-medium transition-colors ${
                        (isLoading || isDuplicate || !nameWatch) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4361ee] hover:bg-[#3f37c9]'
                      }`}
                    >
                      {editingId ? 'Update' : 'Save'}
                    </button>
                    <button 
                      type="button"
                      onClick={handleReset}
                      className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 rounded text-[14px] font-medium transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <h3 className="text-lg font-bold text-gray-800">Vehicle Type List</h3>
                  
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Search Vehicle Types..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-[13px] border-b border-gray-200">
                        <th className="px-4 py-3 font-semibold">Vehicle Type Name</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Created Date</th>
                        <th className="px-4 py-3 font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTypes.length > 0 ? (
                        filteredTypes.map(type => (
                          <tr key={type.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-[14px] text-gray-800 font-medium">{type.name}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                type.status === 'Active' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {type.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[14px] text-gray-500">{type.createdAt}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center space-x-2">
                                <button 
                                  onClick={() => handleEdit(type)}
                                  className="p-1.5 bg-[#f1c40f] text-white rounded hover:opacity-90 transition-opacity"
                                  title="Edit"
                                >
                                  <FiEdit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(type.id)}
                                  className="p-1.5 bg-[#e74c3c] text-white rounded hover:opacity-90 transition-opacity"
                                  title="Delete"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-sm">
                            No vehicle types found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default VehicleTypeMaster;
