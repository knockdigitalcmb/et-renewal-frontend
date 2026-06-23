import React, { useState, useMemo } from 'react';
import Header from '../../components/layout/Header';
import { useCustomer } from '../../context/CustomerContext';
import { MdSearch, MdEdit, MdVisibility, MdDelete } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useImei } from '../../context/ImeiContext';
import { useModal } from '../../context/ModalContext';
import AddImeiModal from '../../components/devices/AddImeiModal';

const IMEINumbers = () => {
  const { customers, updateVehicle } = useCustomer();
  const { imeis, deleteImei } = useImei();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allImeis = useMemo(() => {
    const list = [];
    // 1. Standalone
    imeis.forEach(imei => {
      list.push({
        id: imei.id,
        isLegacy: false,
        customerId: imei.customerId,
        imei: imei.imei,
        customerName: imei.customerName,
        vehicleNo: imei.vehicleNumber || 'Unassigned',
        deviceModel: imei.deviceModel,
        status: imei.status
      });
    });

    // 2. Legacy
    const explicitImeiNumbers = new Set(imeis.map(i => i.imei));
    customers.forEach(customer => {
      if (customer.vehicles && Array.isArray(customer.vehicles)) {
        customer.vehicles.forEach(vehicle => {
          if (vehicle.imei && !explicitImeiNumbers.has(vehicle.imei)) {
            list.push({
              id: vehicle.id,
              isLegacy: true,
              customerId: customer.id,
              imei: vehicle.imei,
              customerName: customer.name,
              vehicleNo: vehicle.vehicleNo,
              deviceModel: vehicle.deviceModel || 'N/A',
              status: vehicle.status || 'Active'
            });
          }
        });
      }
    });
    return list;
  }, [customers, imeis]);

  const filteredImeis = useMemo(() => {
    return allImeis.filter(v => {
      const searchStr = searchTerm.toLowerCase();
      return (
        v.imei?.toLowerCase().includes(searchStr) ||
        v.customerName?.toLowerCase().includes(searchStr) ||
        v.vehicleNo?.toLowerCase().includes(searchStr) ||
        v.deviceModel?.toLowerCase().includes(searchStr)
      );
    });
  }, [allImeis, searchTerm]);

  const handleDelete = (item) => {
    showModal({
      type: 'confirm',
      title: 'Delete IMEI Number',
      message: 'Are you sure you want to delete this IMEI record?',
      buttons: [
        { text: 'Cancel', style: 'secondary' },
        { 
          text: 'Delete', 
          style: 'danger', 
          onClick: async () => {
            if (item.isLegacy) {
              await updateVehicle(item.id, { imei: '' });
            } else {
              deleteImei(item.id);
            }
            showModal({
              type: 'success',
              title: 'Success',
              message: 'IMEI deleted successfully'
            });
          }
        }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">
      <Header />
      <main className="flex-1 p-6">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">IMEI Numbers</h1>
            <p className="text-sm text-gray-500">Global overview of all assigned IMEI numbers</p>
          </div>
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search IMEI, Vehicle, Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#4361ee] hover:bg-[#3b55d1] text-white px-5 py-2 rounded font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            + Add IMEI Number
          </button>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">IMEI Number</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle Number</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Device Model</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredImeis.length > 0 ? (
                  filteredImeis.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-800">{item.imei}</td>
                      <td className="px-6 py-4 text-gray-700">{item.customerName}</td>
                      <td className="px-6 py-4 font-bold text-gray-600">{item.vehicleNo}</td>
                      <td className="px-6 py-4 text-gray-600">{item.deviceModel}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/devices/imei-numbers/view/${item.id}`)}
                          className="text-[#3498db] hover:text-[#2980b9] p-1.5 rounded hover:bg-blue-50 transition-colors mr-2"
                          title="View IMEI"
                        >
                          <MdVisibility className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/devices/imei-numbers/edit/${item.id}`)}
                          className="text-[#f39c12] hover:text-[#e67e22] p-1.5 rounded hover:bg-orange-50 transition-colors mr-2"
                          title="Edit IMEI"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item)}
                          className="text-[#e74c3c] hover:text-[#c0392b] p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete IMEI"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No IMEI numbers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <AddImeiModal 
        isOpen={isAddModalOpen} 
        onClose={(success) => {
          setIsAddModalOpen(false);
          if (success === true) {
            showModal({
              type: 'success',
              title: 'Success',
              message: 'IMEI Number added successfully',
            });
          }
        }} 
      />
    </div>
  );
};

export default IMEINumbers;
