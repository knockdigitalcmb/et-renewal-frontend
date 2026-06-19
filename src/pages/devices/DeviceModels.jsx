import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { useDeviceModel } from '../../context/DeviceModelContext';
import { useModal } from '../../context/ModalContext';
import { useSettings } from '../../context/SettingsContext';
import { useForm } from 'react-hook-form';
import { MdEdit, MdDelete, MdSearch, MdClose, MdVisibility } from 'react-icons/md';

const DeviceModels = () => {
  const { deviceModels, addDeviceModel, updateDeviceModel, deleteDeviceModel, toggleStatus, checkDuplicateName } = useDeviceModel();
  const { showModal } = useModal();
  const { formatDate } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [viewingModel, setViewingModel] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { status: 'Active' }
  });

  const filteredModels = deviceModels.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.manufacturer && m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (model) => {
    setEditingId(model.id);
    reset({
      name: model.name,
      manufacturer: model.manufacturer || '',
      status: model.status || 'Active',
      description: model.description || ''
    });
  };

  const handleReset = () => {
    setEditingId(null);
    reset({ name: '', manufacturer: '', status: 'Active', description: '' });
  };

  const onSubmit = (data) => {
    if (checkDuplicateName(data.name, editingId)) {
      showModal({
        type: 'error',
        title: 'Duplicate Device Model',
        message: `The device model "${data.name}" already exists.`,
      });
      return;
    }

    if (editingId) {
      updateDeviceModel(editingId, data);
      showModal({ type: 'success', title: 'Success', message: 'Device Model updated successfully!' });
    } else {
      addDeviceModel(data);
      showModal({ type: 'success', title: 'Success', message: 'Device Model added successfully!' });
    }
    handleReset();
  };

  const handleDelete = (id) => {
    showModal({
      type: 'warning',
      title: 'Delete Device Model?',
      message: 'This action cannot be undone.',
      buttons: [
        { text: 'Cancel', style: 'secondary' },
        { 
          text: 'Delete', 
          style: 'danger', 
          onClick: () => {
            deleteDeviceModel(id);
            if (editingId === id) handleReset();
            showModal({ type: 'success', title: 'Deleted', message: 'Device model deleted.' });
          }
        }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200">
      <Header />
      <main className="flex-1 p-6">
        
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Mobile Stacking Order: Add/Edit Form moves to top on mobile (order-first on mobile, order-last on desktop) */}
          
          {/* LEFT SIDE: TABLE (70%) */}
          <div className="w-full lg:w-[70%] order-2 lg:order-1 flex flex-col gap-4">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded shadow-sm border border-gray-200 dark:border-gray-700">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  Device Models 
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm py-1 px-2.5 rounded-full font-bold">
                    {deviceModels.length}
                  </span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage GPS device models</p>
              </div>
              <div className="relative w-full md:w-72">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search models or manufacturer..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#4361ee] dark:focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee] transition-colors"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Device Model</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredModels.length > 0 ? (
                      filteredModels.map((model) => (
                        <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                            {model.name}
                            {model.manufacturer && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">{model.manufacturer}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span 
                              onClick={() => toggleStatus(model.id)}
                              className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors inline-block ${model.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                            >
                              {model.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setViewingModel(model)}
                              className="text-[#3498db] hover:text-[#2980b9] p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors mr-2"
                              title="View"
                            >
                              <MdVisibility className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleEdit(model)}
                              className="text-[#f39c12] hover:text-[#e67e22] p-1.5 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors mr-2"
                              title="Edit"
                            >
                              <MdEdit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(model.id)}
                              className="text-[#e74c3c] hover:text-[#c0392b] p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <MdDelete className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center justify-center">
                            <MdSearch className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
                            <p>No device models found.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: ADD/EDIT FORM (30%) */}
          <div className="w-full lg:w-[30%] order-1 lg:order-2">
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 sticky top-6">
              
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                  {editingId ? 'Edit Device Model' : 'Add Device Model'}
                </h2>
                {editingId && (
                  <span className="text-xs font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">Editing Mode</span>
                )}
              </div>

              <div className="p-5">
                <form id="deviceModelForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Device Model Name *</label>
                    <input 
                      {...register('name', { required: 'Model Name is required' })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#4361ee] dark:focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee]"
                      placeholder="Enter device model"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Manufacturer</label>
                    <input 
                      {...register('manufacturer')}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#4361ee] dark:focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee]"
                      placeholder="Example: Teltonika"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Status *</label>
                    <select 
                      {...register('status', { required: 'Status is required' })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#4361ee] dark:focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                    <textarea 
                      {...register('description')}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#4361ee] dark:focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee]"
                      placeholder="Optional details"
                      rows="3"
                    ></textarea>
                  </div>

                </form>
              </div>

              <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 rounded-b">
                <button 
                  type="button" 
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Reset
                </button>
                <button 
                  type="submit" 
                  form="deviceModelForm"
                  className={`px-4 py-2 text-white rounded font-medium transition-colors ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#4361ee] hover:bg-[#3b55d1]'}`}
                >
                  {editingId ? 'Update Model' : '+ Save Model'}
                </button>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* Slide-over View Drawer */}
      {viewingModel && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={() => setViewingModel(null)} />
          <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Device Model Details</h2>
              <button onClick={() => setViewingModel(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Device Model Name</span>
                <span className="text-lg text-gray-800 dark:text-gray-200 font-bold">{viewingModel.name}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Manufacturer</span>
                <span className="text-md text-gray-800 dark:text-gray-200">{viewingModel.manufacturer || 'N/A'}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${viewingModel.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {viewingModel.status}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Description</span>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 min-h-[100px] whitespace-pre-wrap">
                  {viewingModel.description || 'No description provided.'}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-6 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Created Date</span>
                  <span className="text-sm text-gray-800 dark:text-gray-200">{viewingModel.createdAt ? formatDate(viewingModel.createdAt) : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Updated Date</span>
                  <span className="text-sm text-gray-800 dark:text-gray-200">{viewingModel.updatedAt ? formatDate(viewingModel.updatedAt) : 'N/A'}</span>
                </div>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default DeviceModels;
