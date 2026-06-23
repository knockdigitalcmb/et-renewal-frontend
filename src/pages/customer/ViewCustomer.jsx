import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../../context/CustomerContext';
import Header from '../../components/layout/Header';
import { FiRefreshCw, FiEdit } from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';

const ViewCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomer, renewals } = useCustomer();
  const { formatDate } = useSettings();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const data = getCustomer(id);
    if (data) setCustomer(data);
    else navigate('/customers');
  }, [id, getCustomer, navigate]);

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200">
      <Header />
      <main className="flex-1 p-6">
        <div className="bg-white dark:bg-gray-800 rounded shadow-sm mx-auto border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-gray-100 dark:border-gray-700 gap-4">
            <h3 className="text-[1.1rem] font-bold text-gray-800 dark:text-white">
              Customer Details: {customer.name}
            </h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              {/* <button 
                onClick={() => navigate(`/customers/edit/${id}`)}
                className="w-full sm:w-auto bg-[#f39c12] text-white px-4 py-2 text-sm font-medium hover:bg-[#e67e22] transition-colors rounded text-center"
              >
                Edit Customer / Vehicles
              </button> */}
              <button 
                onClick={() => navigate('/customers')}
                className="w-full sm:w-auto bg-[#3498db] text-white px-4 py-2 text-sm font-medium hover:bg-[#2980b9] transition-colors rounded text-center"
              >
                Back to List
              </button>
            </div>
          </div>

          <div className="p-5">
            {/* Owner Information */}
            <h4 className="text-[1rem] font-bold text-gray-800 dark:text-gray-200 mb-4">Owner Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 mb-8 border-t border-gray-100 dark:border-gray-700">
              {/* Row 1 */}
              <div className="flex border-b border-gray-100 dark:border-gray-700">
                <div className="w-1/3 bg-[#f8f9fa] dark:bg-gray-700 p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-300 flex items-center transition-colors">Name</div>
                <div className="w-2/3 p-3 text-[14px] text-gray-800 dark:text-gray-200 flex items-center transition-colors">{customer.name}</div>
              </div>
              <div className="flex border-b border-gray-100 dark:border-gray-700">
                <div className="w-1/3 bg-[#f8f9fa] dark:bg-gray-700 p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-300 flex items-center transition-colors">Email</div>
                <div className="w-2/3 p-3 text-[14px] text-gray-800 dark:text-gray-200 flex items-center transition-colors">{customer.email || 'N/A'}</div>
              </div>
              
              {/* Row 2 */}
              <div className="flex border-b border-gray-100 dark:border-gray-700">
                <div className="w-1/3 bg-[#f8f9fa] dark:bg-gray-700 p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-300 flex items-center transition-colors">Primary Mobile</div>
                <div className="w-2/3 p-3 text-[14px] text-gray-800 dark:text-gray-200 flex items-center transition-colors">{customer.mobile}</div>
              </div>
              <div className="flex border-b border-gray-100 dark:border-gray-700">
                <div className="w-1/3 bg-[#f8f9fa] dark:bg-gray-700 p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-300 flex items-center transition-colors">Location</div>
                <div className="w-2/3 p-3 text-[14px] text-gray-800 dark:text-gray-200 flex items-center transition-colors">{customer.location}</div>
              </div>
              
              {/* Alternate Mobiles */}
              {customer.altMobile1 && (
                <div className="flex border-b border-gray-100 dark:border-gray-700">
                  <div className="w-1/3 bg-[#f8f9fa] dark:bg-gray-700 p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-300 flex items-center transition-colors">Alternate Mobile 1</div>
                  <div className="w-2/3 p-3 text-[14px] text-gray-800 dark:text-gray-200 flex items-center transition-colors">{customer.altMobile1}</div>
                </div>
              )}
              {customer.altMobile2 && (
                <div className="flex border-b border-gray-100 dark:border-gray-700">
                  <div className="w-1/3 bg-[#f8f9fa] dark:bg-gray-700 p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-300 flex items-center transition-colors">Alternate Mobile 2</div>
                  <div className="w-2/3 p-3 text-[14px] text-gray-800 dark:text-gray-200 flex items-center transition-colors">{customer.altMobile2}</div>
                </div>
              )}
              {customer.altMobile3 && (
                <div className="flex border-b border-gray-100 dark:border-gray-700">
                  <div className="w-1/3 bg-[#f8f9fa] dark:bg-gray-700 p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-300 flex items-center transition-colors">Alternate Mobile 3</div>
                  <div className="w-2/3 p-3 text-[14px] text-gray-800 dark:text-gray-200 flex items-center transition-colors">{customer.altMobile3}</div>
                </div>
              )}

              <div className="flex border-b border-gray-100 dark:border-gray-700">
                <div className="w-1/3 bg-[#f8f9fa] dark:bg-gray-700 p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-300 flex items-center transition-colors">Lead Closure By</div>
                <div className="w-2/3 p-3 text-[14px] text-gray-800 dark:text-gray-200 flex items-center transition-colors">{customer.leadClosureBy}</div>
              </div>
            </div>


            {/* Renewal Financial Summary */}
            {(() => {
              const custRenewals = renewals.filter(r => r.customerId === customer.id || r.customer === customer.name);
              const totalRenewal = custRenewals.reduce((sum, r) => sum + (parseFloat(r.renewalAmount) || 0), 0);
              const totalPaid = custRenewals.reduce((sum, r) => sum + (parseFloat(r.amountPaid) || 0), 0);
              const totalPending = custRenewals.reduce((sum, r) => sum + (parseFloat(r.pendingAmount) || 0), 0);
              
              if (custRenewals.length === 0) return null;

              return (
                <div className="mb-8">
                  <h4 className="text-[1rem] font-bold text-gray-800 dark:text-gray-200 mb-4">Renewal Financial Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-100 dark:border-blue-800">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">Total Renewal Amount</p>
                      <p className="text-xl font-bold text-blue-900 dark:text-blue-300">₹{totalRenewal}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-100 dark:border-green-800">
                      <p className="text-sm text-green-600 dark:text-green-400 font-semibold mb-1">Total Paid Amount</p>
                      <p className="text-xl font-bold text-green-900 dark:text-green-300">₹{totalPaid}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-100 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-1">Total Pending Amount</p>
                      <p className="text-xl font-bold text-red-900 dark:text-red-300">₹{totalPending}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Vehicle List */}
            <h4 className="text-[1rem] font-bold text-gray-800 dark:text-gray-200 mb-4">Vehicle List</h4>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#f8f9fa] dark:bg-gray-800/50 border-t border-b border-gray-100 dark:border-gray-700">
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Vehicle Number</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Platform</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Vehicle Type</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">IMEI</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">SIM Number</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Install Date</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Validity</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Expiry Date</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600 dark:text-gray-400">Pending Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.vehicles && customer.vehicles.length > 0 ? (
                    customer.vehicles.map((vehicle, index) => (
                      <tr key={vehicle.id || index} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="p-3 text-[14px] text-gray-700 dark:text-gray-300">{vehicle.vehicleNo}</td>
                        <td className="p-3 text-[14px] text-gray-700 dark:text-gray-300">{vehicle.platform || '-'}</td>
                        <td className="p-3 text-[14px] text-gray-700 dark:text-gray-300">{vehicle.vehicleType || 'Car'}</td>
                        <td className="p-3 text-[14px] text-gray-700 dark:text-gray-300">{vehicle.imei}</td>
                        <td className="p-3 text-[14px] text-gray-700 dark:text-gray-300">{vehicle.simNumber}</td>
                        <td className="p-3 text-[14px] text-gray-700 dark:text-gray-300">{formatDate(vehicle.installDate)}</td>
                        <td className="p-3 text-[14px] text-gray-700 dark:text-gray-300">{vehicle.validity} M</td>
                        <td className="p-3">
                          <span className="bg-[#d4edda] dark:bg-green-900/30 text-[#155724] dark:text-green-400 px-2 py-1 rounded text-[12px] font-medium tracking-wide">
                            {formatDate(vehicle.expiryDate)}
                          </span>
                        </td>
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No vehicles found.</td>
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

export default ViewCustomer;
