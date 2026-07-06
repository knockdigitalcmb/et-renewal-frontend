import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../../components/layout/Header';
import { useVehicleType } from '../../context/VehicleTypeContext';
import { useModal } from '../../context/ModalContext';
import { useSettings } from '../../context/SettingsContext';
import { FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const VehicleTypeMaster = () => {
  const {
  vehicleTypes,
  addVehicleType,
  updateVehicleType,
  deleteVehicleType,
  isLoading
} = useVehicleType();
  const { showModal } = useModal();
  const { formatDate } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, formState: { errors: errorsAdd } } = useForm({
    defaultValues: { status: 'Active' }
  });

  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: errorsEdit } } = useForm();

  const onAddSubmit = async (data) => {
    // Check if duplicate name exists
    const isDuplicate = vehicleTypes.some(vt => vt.name.toLowerCase() === data.name.toLowerCase().trim());
    if (isDuplicate) {
      showModal({ type: 'error', title: 'Duplicate Name', message: 'Vehicle Type already exists!' });
      return;
    }
    const result = await addVehicleType({
  name: data.name.trim(),
  status: data.status
});

if (result.success) {
  resetAdd();

  showModal({
    type: "success",
    title: "Success",
    message:
      "Vehicle Type added successfully."
  });
} else {
  showModal({
    type: "error",
    title: "Error",
    message:
      result.message ||
      "Failed to create vehicle type"
  });
}
  };

  const onEditSubmit = async (data) => {
    // Check if duplicate name exists (excluding current)
    const isDuplicate = vehicleTypes.some(vt => vt.id !== editingType.id && vt.name.toLowerCase() === data.name.toLowerCase().trim());
    if (isDuplicate) {
      showModal({ type: 'error', title: 'Duplicate Name', message: 'Vehicle Type name already exists!' });
      return;
    }
    const result =
  await updateVehicleType(
    editingType.id,
    {
      name: data.name.trim(),
      status: data.status
    }
  );

if (result.success) {
  setShowEditModal(false);

  setEditingType(null);

  showModal({
    type: "success",
    title: "Success",
    message:
      "Vehicle Type updated successfully."
  });
} else {
  showModal({
    type: "error",
    title: "Error",
    message:
      result.message ||
      "Failed to update vehicle type"
  });
}
  };

  const openEditModal = (vt) => {
    setEditingType(vt);
    resetEdit({ name: vt.name, status: vt.status });
    setShowEditModal(true);
  };

  const confirmDelete = (id) => {
    showModal({
      type: 'confirm',
      title: 'Delete Vehicle Type',
      message: 'Are you sure you want to delete this vehicle type? This action cannot be undone.',
      buttons: [
        { text: 'Cancel', style: 'secondary' },
        { 
          text: 'Delete', 
          style: 'danger', 
          onClick: async () => {
  const result =
    await deleteVehicleType(id);

  if (result.success) {
    showModal({
      type: "success",
      title: "Success",
      message:
        "Vehicle Type deleted successfully."
    });
  } else {
    showModal({
      type: "error",
      title: "Error",
      message:
        result.message ||
        "Delete failed"
    });
  }
}
        }
      ]
    });
  };

  const filteredTypes = vehicleTypes.filter(vt => 
    vt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Vehicle Type Master</h1>
          </div>

          {/* Add Vehicle Type Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Add Vehicle Type</h2>
            <form onSubmit={handleSubmitAdd(onAddSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Vehicle Type Name *</label>
                  <input 
                    {...registerAdd('name', { required: 'Name is required' })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-[14px] bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="e.g. Tractor"
                  />
                  {errorsAdd.name && <p className="text-red-500 text-xs mt-1">{errorsAdd.name.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                  <select 
                    {...registerAdd('status', { required: 'Status is required' })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-[14px] bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <div className="flex space-x-3">
  <button
    type="submit"
    disabled={isLoading}
    className="flex-1 bg-[#4a6cf7] hover:bg-[#3a5bd9] text-white px-4 py-2 rounded font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
  >
    {isLoading ? "Saving..." : "Save"}
  </button>

  <button
    type="button"
    onClick={() => resetAdd()}
    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded font-medium text-sm transition-colors"
  >
    Reset
  </button>
</div>
                </div>
              </div>
            </form>
          </div>

          {/* List Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Vehicle Types List</h2>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                    <th className="p-4 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Vehicle Type Name</th>
                    <th className="p-4 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="p-4 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Created Date</th>
                    <th className="p-4 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="dark:text-gray-300">
                  {filteredTypes.length > 0 ? (
                    filteredTypes.map((vt) => (
                      <tr key={vt.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="p-4 text-[14px] text-gray-800 dark:text-gray-200 font-medium">{vt.name}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            vt.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {vt.status}
                          </span>
                        </td>
                        <td className="p-4 text-[14px] text-gray-600 dark:text-gray-400">{formatDate(vt.createdDate)}</td>
                        <td className="p-4 flex space-x-2">
                          <button 
                            onClick={() => openEditModal(vt)}
                            className="p-1.5 bg-[#f1c40f] hover:bg-[#f39c12] text-white rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(vt.id)}
                            className="p-1.5 bg-[#e74c3c] hover:bg-[#c0392b] text-white rounded transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No vehicle types found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Edit Vehicle Type</h3>
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Vehicle Type Name *</label>
                <input 
                  {...registerEdit('name', { required: 'Name is required' })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-[14px] bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
                {errorsEdit.name && <p className="text-red-500 text-xs mt-1">{errorsEdit.name.message}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                <select 
                  {...registerEdit('status', { required: 'Status is required' })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-[14px] bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
  type="submit"
  disabled={isLoading}
  className="px-4 py-2 text-sm font-medium text-white bg-[#4a6cf7] rounded hover:bg-[#3a5bd9] transition-colors disabled:opacity-50"
>
  {isLoading ? "Updating..." : "Update"}
</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VehicleTypeMaster;
