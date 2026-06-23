import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { useImei } from '../../context/ImeiContext';
import { useCustomer } from '../../context/CustomerContext';
import { useSettings } from '../../context/SettingsContext';

const ViewImei = () => {
  const { imeiId } = useParams();
  const navigate = useNavigate();
  const { imeis } = useImei();
  const { customers } = useCustomer();
  const { formatDate } = useSettings();

  const [imeiDetails, setImeiDetails] = useState(null);

  useEffect(() => {
    // 1. Search in standalone ImeiContext
    let foundImei = imeis.find(i => i.id === imeiId);
    let imeiData = null;

    if (foundImei) {
      let customerMobile = 'N/A';
      let vehicleNo = 'Unassigned';
      let simNo = 'N/A';
      
      const cust = customers.find(c => c.id === foundImei.customerId);
      if (cust) {
        customerMobile = cust.mobile || 'N/A';
        const vehicle = cust.vehicles?.find(v => v.imei === foundImei.imei);
        if (vehicle) {
          vehicleNo = vehicle.vehicleNo || 'Unassigned';
          simNo = vehicle.simNumber || 'N/A';
        }
      }

      imeiData = {
        imei: foundImei.imei,
        deviceModel: foundImei.deviceModel,
        status: foundImei.status,
        customerName: foundImei.customerName || 'Unassigned',
        customerMobile: customerMobile,
        vehicleNumber: vehicleNo,
        simNumber: simNo,
        createdAt: foundImei.createdAt ? formatDate(foundImei.createdAt) : 'N/A',
        updatedAt: foundImei.updatedAt ? formatDate(foundImei.updatedAt) : 'N/A',
      };
    } else {
      // 2. Search in CustomerContext (Legacy IMEIs)
      for (const cust of customers) {
        if (cust.vehicles) {
          const vehicle = cust.vehicles.find(v => v.id === imeiId);
          if (vehicle && vehicle.imei) {
            imeiData = {
              imei: vehicle.imei,
              deviceModel: vehicle.deviceModel || 'N/A',
              status: vehicle.status || 'Active',
              customerName: cust.name,
              customerMobile: cust.mobile || 'N/A',
              vehicleNumber: vehicle.vehicleNo,
              simNumber: vehicle.simNumber || 'N/A',
              createdAt: vehicle.installDate ? formatDate(vehicle.installDate) : 'N/A',
              updatedAt: 'N/A',
            };
            break;
          }
        }
      }
    }

    if (imeiData) {
      setImeiDetails(imeiData);
    } else {
      setImeiDetails(null);
    }
  }, [imeiId, imeis, customers, formatDate]);

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200">
      <Header />
      <main className="flex-1 p-6">
        
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">IMEI Details</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">View complete information for this IMEI</p>
          </div>
          <button 
            onClick={() => navigate('/devices/imei-numbers')}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            &larr; Back to IMEI List
          </button>
        </div>

        {!imeiDetails ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <h2 className="text-xl text-gray-600 dark:text-gray-300">IMEI Number not found</h2>
            <button onClick={() => navigate('/devices/imei-numbers')} className="mt-4 text-[#4361ee] underline">Return to List</button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            {/* Header Section */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-mono tracking-wide">{imeiDetails.imei}</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Model: <span className="text-gray-700 dark:text-gray-300">{imeiDetails.deviceModel}</span></span>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    imeiDetails.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {imeiDetails.status}
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
                  <span className="text-[15px] text-gray-800 dark:text-gray-200 font-medium">{imeiDetails.customerName}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Customer Mobile Number</span>
                  <span className="text-[15px] text-gray-800 dark:text-gray-200">{imeiDetails.customerMobile}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Assigned Vehicle Number</span>
                  <span className="text-[15px] text-gray-800 dark:text-gray-200 font-bold">{imeiDetails.vehicleNumber}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">SIM Number</span>
                  <span className="text-[15px] text-gray-800 dark:text-gray-200 font-mono">{imeiDetails.simNumber}</span>
                </div>

              </div>

              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 mt-8">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Created Date</span>
                  <span className="text-[15px] text-gray-800 dark:text-gray-200">{imeiDetails.createdAt}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Last Updated Date</span>
                  <span className="text-[15px] text-gray-800 dark:text-gray-200">{imeiDetails.updatedAt}</span>
                </div>

              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default ViewImei;
