import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import StatsCard from './StatsCard';
import { useCustomer } from '../context/CustomerContext';
import { getExpiringCustomers } from '../utils/customerUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { customers, renewals } = useCustomer();

  const dashboardStats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalRenewals = renewals.length;
    
    let pendingPayments = 0;

    customers.forEach(customer => {
      // Calculate Pending per Vehicle
      if (customer.vehicles && Array.isArray(customer.vehicles) && customer.vehicles.length > 0) {
        customer.vehicles.forEach(v => {
          pendingPayments += (parseFloat(v.pendingAmount) || 0);
        });
      } else {
        // Fallback for flat structure
        pendingPayments += (parseFloat(customer.pendingAmount) || 0);
      }
    });

    const expiringWithin30Days = getExpiringCustomers(customers).length;

    const recentCustomers = [...customers].sort((a, b) => {
      // id is Date.now().toString() based on our mock db
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : Number(a.id));
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : Number(b.id));
      return timeB - timeA; // DESC
    }).slice(0, 5);

    return { totalCustomers, totalRenewals, pendingPayments, expiringWithin30Days, recentCustomers };
  }, [customers, renewals]);

  const { totalCustomers, totalRenewals, pendingPayments, expiringWithin30Days, recentCustomers } = dashboardStats;

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col">
      <Header />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatsCard title="Total Customers" value={totalCustomers} valueColor="text-blue-600" linkTo="/customers" />
            <StatsCard title="Total Renewals" value={totalRenewals} valueColor="text-green-500" linkTo="/renewals" />
            <StatsCard title="Pending Payments" value={`₹${pendingPayments.toLocaleString()}`} valueColor="text-red-500" linkTo="/customers?payment=pending" />
            <StatsCard title="Expiring within 30 Days" value={expiringWithin30Days} valueColor="text-orange-500" linkTo="/customers?expiry=30days" />
          </div>
          
          {/* Recent Customers Section */}
          <div className="bg-white rounded-md border border-gray-100 shadow-sm mt-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Recent Customers</h2>
              <button 
                onClick={() => navigate('/customers/add')}
                className="bg-[#4361ee] hover:bg-[#3b55d1] text-white px-5 py-2 rounded font-medium text-sm transition-colors shadow-sm"
              >
                + New Customer
              </button>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Vehicle No.</th>
                    <th className="px-6 py-4 font-medium">Mobile</th>
                    <th className="px-6 py-4 font-medium">Install Date</th>
                    <th className="px-6 py-4 font-medium">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-600">
                  {recentCustomers.map((customer, index) => {
                    const expiryToUse = customer.vehicles && customer.vehicles.length > 0 
                      ? customer.vehicles[0].expiryDate 
                      : (customer.renewalDate || customer.expiryDate);
                    
                    const installToUse = customer.vehicles && customer.vehicles.length > 0
                      ? customer.vehicles[0].installDate
                      : customer.installDate;
                      
                    const isExpired = expiryToUse === '-' || new Date(expiryToUse) < new Date();
                    return (
                      <tr 
                        key={index} 
                        onClick={() => navigate(`/customers/view/${customer.id}`)}
                        className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 text-gray-800">{customer.name}</td>
                        <td className="px-6 py-4">{customer.vehicleNo}</td>
                        <td className="px-6 py-4">{customer.mobile}</td>
                        <td className="px-6 py-4">{installToUse}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                            isExpired ? 'bg-[#fee2e2] text-[#ef4444]' : 'bg-[#e6f8ec] text-[#2ecc71]'
                          }`}>
                            {expiryToUse}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 text-right border-t border-gray-100">
              <Link to="/customers" className="text-blue-600 text-sm hover:text-blue-800 transition-colors">
                View All Customers &rarr;
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
