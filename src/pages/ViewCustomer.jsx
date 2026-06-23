import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import Header from '../components/Header';
import { FiRefreshCw, FiEdit } from 'react-icons/fi';

const ViewCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomer } = useCustomer();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const data = getCustomer(id);
    if (data) setCustomer(data);
    else navigate('/customers');
  }, [id, getCustomer, navigate]);

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">
      <Header />
      <main className="flex-1 p-6">
        <div className="bg-white rounded shadow-sm mx-auto border border-gray-200">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-gray-100 gap-4">
            <h3 className="text-[1.1rem] font-bold text-gray-800">
              Customer Details: {customer.name}
            </h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <button 
                onClick={() => navigate(`/customers/edit/${id}`)}
                className="w-full sm:w-auto bg-[#f39c12] text-white px-4 py-2 text-sm font-medium hover:bg-[#e67e22] transition-colors rounded text-center"
              >
                Edit Customer / Vehicles
              </button>
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
            <h4 className="text-[1rem] font-bold text-gray-800 mb-4">Owner Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 mb-8 border-t border-gray-100">
              {/* Row 1 */}
              <div className="flex border-b border-gray-100">
                <div className="w-1/3 bg-[#f8f9fa] p-3 text-[13px] font-semibold text-gray-600 flex items-center">Name</div>
                <div className="w-2/3 p-3 text-[14px] text-gray-800 flex items-center">{customer.name}</div>
              </div>
              <div className="flex border-b border-gray-100">
                <div className="w-1/3 bg-[#f8f9fa] p-3 text-[13px] font-semibold text-gray-600 flex items-center">Email</div>
                <div className="w-2/3 p-3 text-[14px] text-gray-800 flex items-center">{customer.email || 'N/A'}</div>
              </div>
              
              {/* Row 1.5 */}
              <div className="flex border-b border-gray-100">
                <div className="w-1/3 bg-[#f8f9fa] p-3 text-[13px] font-semibold text-gray-600 flex items-center">Platform</div>
                <div className="w-2/3 p-3 text-[14px] text-gray-800 flex items-center">
                  {customer.platform ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {customer.platform}
                    </span>
                  ) : 'N/A'}
                </div>
              </div>
              <div className="flex border-b border-gray-100">
                {/* Empty cell for grid alignment since Email and Platform are now 3 items */}
                <div className="w-1/3 bg-[#f8f9fa] p-3 text-[13px] font-semibold text-gray-600 flex items-center">Username</div>
                <div className="w-2/3 p-3 text-[14px] text-gray-800 flex items-center">{customer.name}</div>
              </div>
              
              {/* Row 2 */}
              <div className="flex border-b border-gray-100">
                <div className="w-1/3 bg-[#f8f9fa] p-3 text-[13px] font-semibold text-gray-600 flex items-center">Primary Mobile</div>
                <div className="w-2/3 p-3 text-[14px] text-gray-800 flex items-center">{customer.mobile}</div>
              </div>
              <div className="flex border-b border-gray-100">
                <div className="w-1/3 bg-[#f8f9fa] p-3 text-[13px] font-semibold text-gray-600 flex items-center">Location</div>
                <div className="w-2/3 p-3 text-[14px] text-gray-800 flex items-center">{customer.location}</div>
              </div>
              
              {/* Alternate Mobiles */}
              {customer.altMobile1 && (
                <div className="flex border-b border-gray-100">
                  <div className="w-1/3 bg-[#f8f9fa] p-3 text-[13px] font-semibold text-gray-600 flex items-center">Alternate Mobile 1</div>
                  <div className="w-2/3 p-3 text-[14px] text-gray-800 flex items-center">{customer.altMobile1}</div>
                </div>
              )}
              {customer.altMobile2 && (
                <div className="flex border-b border-gray-100">
                  <div className="w-1/3 bg-[#f8f9fa] p-3 text-[13px] font-semibold text-gray-600 flex items-center">Alternate Mobile 2</div>
                  <div className="w-2/3 p-3 text-[14px] text-gray-800 flex items-center">{customer.altMobile2}</div>
                </div>
              )}
              {customer.altMobile3 && (
                <div className="flex border-b border-gray-100">
                  <div className="w-1/3 bg-[#f8f9fa] p-3 text-[13px] font-semibold text-gray-600 flex items-center">Alternate Mobile 3</div>
                  <div className="w-2/3 p-3 text-[14px] text-gray-800 flex items-center">{customer.altMobile3}</div>
                </div>
              )}

              <div className="flex border-b border-gray-100">
                <div className="w-1/3 bg-[#f8f9fa] p-3 text-[13px] font-semibold text-gray-600 flex items-center">Lead Closure By</div>
                <div className="w-2/3 p-3 text-[14px] text-gray-800 flex items-center">{customer.leadClosureBy}</div>
              </div>
            </div>

            {/* Vehicle List */}
            <h4 className="text-[1rem] font-bold text-gray-800 mb-4">Vehicle List</h4>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#f8f9fa] border-t border-b border-gray-100">
                    <th className="p-3 text-[13px] font-semibold text-gray-600">Vehicle Number</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">Vehicle Type</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">IMEI</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">SIM Number</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">Install Date</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">Validity</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">Expiry Date</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">Pending Amount</th>
                    <th className="p-3 text-[13px] font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.vehicles && customer.vehicles.length > 0 ? (
                    customer.vehicles.map((vehicle, index) => (
                      <tr key={vehicle.id || index} className="border-b border-gray-100">
                        <td className="p-3 text-[14px] text-gray-700">{vehicle.vehicleNo}</td>
                        <td className="p-3 text-[14px] text-gray-700">{vehicle.vehicleType || 'Car'}</td>
                        <td className="p-3 text-[14px] text-gray-700">{vehicle.imei}</td>
                        <td className="p-3 text-[14px] text-gray-700">{vehicle.simNumber}</td>
                        <td className="p-3 text-[14px] text-gray-700">{vehicle.installDate}</td>
                        <td className="p-3 text-[14px] text-gray-700">{vehicle.validity} M</td>
                        <td className="p-3">
                          <span className="bg-[#d4edda] text-[#155724] px-2 py-1 rounded text-[12px] font-medium">
                            {vehicle.expiryDate}
                          </span>
                        </td>
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
                            title="Renewal"
                            onClick={() => navigate(`/customers/renewal/${vehicle.id}`)}
                            className="bg-[#2ecc71] hover:bg-[#27ae60] text-white p-1.5 rounded transition-colors"
                          >
                            <FiRefreshCw size={14} />
                          </button>
                          <button 
                            title="Edit Vehicle"
                            onClick={() => navigate(`/customers/vehicle/edit/${vehicle.id}`)}
                            className="bg-[#3498db] hover:bg-[#2980b9] text-white p-1.5 rounded transition-colors"
                          >
                            <FiEdit size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="p-4 text-center text-sm text-gray-500">No vehicles found.</td>
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
