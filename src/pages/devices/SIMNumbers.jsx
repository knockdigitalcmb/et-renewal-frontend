import React, { useState, useMemo } from 'react';
import Header from '../../components/layout/Header';
import { useCustomer } from '../../context/CustomerContext';
import { useSim } from '../../context/SimContext';
import { useModal } from '../../context/ModalContext';
import AddSIMModal from '../../components/devices/AddSIMModal';
import { MdSearch, MdEdit, MdVisibility, MdDelete } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import EditSIMModal from '../../components/devices/EditSIMModal';

const SIMNumbers = () => {
  const { customers, updateVehicle } = useCustomer();
  const { sims, deleteSim } = useSim();
  const navigate = useNavigate();
  const { showModal } = useModal();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [simToEdit, setSimToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const allSims = useMemo(() => {
    const list = [];
    // 1. Add all standalone sims from SimContext
    sims.forEach(sim => {
      list.push({
        id: sim.id,
        isLegacy: false,
        customerId: sim.customerId,
        simNumber: sim.simNumber,
        customerName: sim.customerName,
        vehicleNo: sim.vehicleNumber,
        provider: sim.provider,
        status: sim.status
      });
    });

    // 2. Add sims from vehicles that aren't already in SimContext
    const explicitSimNumbers = new Set(sims.map(s => s.simNumber));
    
    customers.forEach(customer => {
      if (customer.vehicles && Array.isArray(customer.vehicles)) {
        customer.vehicles.forEach(vehicle => {
          if (vehicle.simNumber && !explicitSimNumbers.has(vehicle.simNumber)) {
            list.push({
              id: vehicle.id,
              isLegacy: true,
              customerId: customer.id,
              simNumber: vehicle.simNumber,
              customerName: customer.name,
              vehicleNo: vehicle.vehicleNo,
              provider: 'N/A',
              status: vehicle.status || 'Active'
            });
          }
        });
      }
    });
    return list;
  }, [customers, sims]);

  const filteredSims = useMemo(() => {
    return allSims.filter(v => {
      const searchStr = searchTerm.toLowerCase();
      return (
        v.simNumber?.toLowerCase().includes(searchStr) ||
        v.customerName?.toLowerCase().includes(searchStr) ||
        v.vehicleNo?.toLowerCase().includes(searchStr) ||
        v.provider?.toLowerCase().includes(searchStr)
      );
    });
  }, [allSims, searchTerm]);

  const handleEdit = (sim) => {
    setSimToEdit(sim);
    setIsEditModalOpen(true);
  };

  const handleDelete = (sim) => {
    showModal({
      type: 'confirm',
      title: 'Delete SIM Number',
      message: 'Are you sure you want to delete this SIM?',
      buttons: [
        { text: 'Cancel', style: 'secondary' },
        { 
          text: 'Delete', 
          style: 'danger', 
          onClick: async () => {
            if (sim.isLegacy) {
              await updateVehicle(sim.id, { simNumber: '' });
            } else {
              deleteSim(sim.id);
            }
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
            <h1 className="text-2xl font-bold text-gray-800">SIM Numbers</h1>
            <p className="text-sm text-gray-500">Global overview of all assigned SIM numbers</p>
          </div>
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search SIM, Vehicle, Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#4361ee] hover:bg-[#3b55d1] text-white px-5 py-2 rounded font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            + Add SIM Number
          </button>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">SIM Number</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle Number</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">SIM Provider</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSims.length > 0 ? (
                  filteredSims.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-800">{item.simNumber}</td>
                      <td className="px-6 py-4 text-gray-700">{item.customerName}</td>
                      <td className="px-6 py-4 font-bold text-gray-600">{item.vehicleNo}</td>
                      <td className="px-6 py-4 text-gray-600">{item.provider}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/devices/sim-numbers/view/${item.id}`)}
                          className="text-[#3498db] hover:text-[#2980b9] p-1.5 rounded hover:bg-blue-50 transition-colors mr-2"
                          title="View SIM"
                        >
                          <MdVisibility className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(item)}
                          className="text-[#f39c12] hover:text-[#e67e22] p-1.5 rounded hover:bg-orange-50 transition-colors mr-2"
                          title="Edit SIM"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item)}
                          className="text-[#e74c3c] hover:text-[#c0392b] p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete SIM"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No SIM numbers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <AddSIMModal 
        isOpen={isAddModalOpen} 
        onClose={(success) => {
          setIsAddModalOpen(false);
          if (success === true) {
            showModal({
              type: 'success',
              title: 'Success',
              message: 'SIM Number added successfully',
            });
          }
        }} 
      />
      <EditSIMModal 
        isOpen={isEditModalOpen} 
        editData={simToEdit}
        onClose={(success) => {
          setIsEditModalOpen(false);
          setSimToEdit(null);
          if (success === true) {
            showModal({
              type: 'success',
              title: 'Success',
              message: 'SIM Number updated successfully',
            });
          }
        }} 
      />
    </div>
  );
};

export default SIMNumbers;
