import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { useSim } from '../../context/SimContext';
import { useCustomer } from '../../context/CustomerContext';
import { useSettings } from '../../context/SettingsContext';

const ViewSIM = () => {
  const { simId } = useParams();
  const navigate = useNavigate();
  const { sims } = useSim();
  const { customers } = useCustomer();
  const { formatDate } = useSettings();

  const [simDetails, setSimDetails] = useState(null);

  useEffect(() => {
    // 1. Search in standalone SimContext
    let foundSim = sims.find(s => s.id === simId);
    let simData = null;

    if (foundSim) {
      // Look up customer to get mobile number and IMEI if possible
      let customerMobile = 'N/A';
      let imei = 'N/A';
      
      const cust = customers.find(c => c.id === foundSim.customerId);
      if (cust) {
        customerMobile = cust.mobile || 'N/A';
        const vehicle = cust.vehicles?.find(v => v.vehicleNo === foundSim.vehicleNumber);
        if (vehicle) {
          imei = vehicle.imei || 'N/A';
        }
      }

      simData = {
        simNumber: foundSim.simNumber,
        provider: foundSim.provider,
        network: foundSim.provider,
        status: foundSim.status,
        customerName: foundSim.customerName || 'Unassigned',
        customerMobile: customerMobile,
        vehicleNumber: foundSim.vehicleNumber || 'Unassigned',
        imei: imei,
        createdAt: foundSim.createdAt ? formatDate(foundSim.createdAt) : 'N/A',
        updatedAt: foundSim.createdAt ? formatDate(foundSim.createdAt) : 'N/A',
      };
    } else {
      // 2. Search in CustomerContext (Legacy SIMs)
      for (const cust of customers) {
        if (cust.vehicles) {
          const vehicle = cust.vehicles.find(v => v.id === simId);
          if (vehicle && vehicle.simNumber) {
            simData = {
              simNumber: vehicle.simNumber,
              provider: 'N/A',
              network: 'N/A',
              status: vehicle.status || 'Active',
              customerName: cust.name,
              customerMobile: cust.mobile || 'N/A',
              vehicleNumber: vehicle.vehicleNo,
              imei: vehicle.imei || 'N/A',
              createdAt: vehicle.installDate ? formatDate(vehicle.installDate) : 'N/A',
              updatedAt: 'N/A',
            };
            break;
          }
        }
      }
    }

    if (simData) {
      setSimDetails(simData);
    } else {
      // Not found, maybe navigate back or show error
      setSimDetails(null);
    }
  }, [simId, sims, customers, formatDate]);

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200">
      <Header />
      <main className="flex-1 p-6">
        
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">SIM Details</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">View complete information for this SIM</p>
          </div>
          <button 
            onClick={() => navigate('/devices/sim-numbers')}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            &larr; Back to SIM Numbers
          </button>
        </div>

        {!simDetails ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <h2 className="text-xl text-gray-600 dark:text-gray-300">SIM Number not found</h2>
            <button onClick={() => navigate('/devices/sim-numbers')} className="mt-4 text-[#4361ee] underline">Return to List</button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            {/* Header Section */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-mono tracking-wide">{simDetails.simNumber}</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Provider: <span className="text-gray-700 dark:text-gray-300">{simDetails.provider}</span></span>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    simDetails.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                    simDetails.status === 'Suspended' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {simDetails.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Assignment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Assigned Customer</span>
                  <span className="text-[15px] text-gray-800 dark:text-gray-200 font-medium">{simDetails.customerName}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Customer Mobile Number</span>
                  <span className="text-[15px] text-gray-800 dark:text-gray-200">{simDetails.customerMobile}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Assigned Vehicle Number</span>
                  <span className="text-[15px] text-gray-800 dark:text-gray-200 font-bold">{simDetails.vehicleNumber}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">IMEI Number</span>
                  <span className="text-[15px] text-gray-800 dark:text-gray-200 font-mono">{simDetails.imei}</span>
                </div>

              </div>

              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 mt-8">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Created Date</span>
                  <span className="text-[15px] text-gray-800 dark:text-gray-200">{simDetails.createdAt}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Last Updated Date</span>
                  <span className="text-[15px] text-gray-800 dark:text-gray-200">{simDetails.updatedAt}</span>
                </div>

              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default ViewSIM;
