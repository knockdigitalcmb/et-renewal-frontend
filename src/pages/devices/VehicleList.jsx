import React, { useState, useMemo } from 'react';
import Header from '../../components/layout/Header';
import { useCustomer } from '../../context/CustomerContext';
import { useSettings } from '../../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdEdit, MdVisibility } from 'react-icons/md';

const VehicleList = () => {
  const { customers } = useCustomer();
  const { formatDate } = useSettings();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const allVehicles = useMemo(() => {
    const list = [];
    customers.forEach(customer => {
      if (customer.vehicles && Array.isArray(customer.vehicles)) {
        customer.vehicles.forEach(vehicle => {
          list.push({
            ...vehicle,
            customerName: customer.name,
            customerId: customer.id
          });
        });
      }
    });
    return list;
  }, [customers]);

  const filteredVehicles = useMemo(() => {
    return allVehicles.filter(v => {
      const searchStr = searchTerm.toLowerCase();
      return (
        v.vehicleNo?.toLowerCase().includes(searchStr) ||
        v.customerName?.toLowerCase().includes(searchStr) ||
        v.imei?.toLowerCase().includes(searchStr) ||
        v.simNumber?.toLowerCase().includes(searchStr) ||
        v.deviceModel?.toLowerCase().includes(searchStr)
      );
    });
  }, [allVehicles, searchTerm]);

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">
      <Header />
      <main className="flex-1 p-6">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Vehicle List</h1>
            <p className="text-sm text-gray-500">View and manage all registered vehicles</p>
          </div>
          <div className="relative w-full md:w-64">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search vehicles, IMEI, SIM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle No</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">IMEI</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">SIM Number</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Install Date</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800">{vehicle.vehicleNo}</td>
                      <td className="px-6 py-4 text-gray-700">{vehicle.customerName}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{vehicle.platform || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{vehicle.vehicleType || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{vehicle.deviceModel || 'N/A'}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">{vehicle.imei || 'N/A'}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">{vehicle.simNumber || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{vehicle.installDate ? formatDate(vehicle.installDate) : 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{vehicle.expiryDate ? formatDate(vehicle.expiryDate) : 'N/A'}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/customers/view/${vehicle.customerId}`)}
                          className="text-[#3498db] hover:text-[#2980b9] p-1.5 rounded hover:bg-blue-50 transition-colors mr-2"
                          title="View Customer"
                        >
                          <MdVisibility className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/customers/vehicle/edit/${vehicle.id}`)}
                          className="text-[#f39c12] hover:text-[#e67e22] p-1.5 rounded hover:bg-orange-50 transition-colors"
                          title="Edit Vehicle"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                      No vehicles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VehicleList;
