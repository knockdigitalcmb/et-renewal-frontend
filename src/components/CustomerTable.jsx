import React from 'react';
import ActionButtons from './ActionButtons';

const CustomerTable = ({ customers, onView, onEdit, onRenew, onDelete }) => {
  if (!customers || customers.length === 0) {
    return (
      <div className="bg-white rounded-md border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
        No customers found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border border-gray-100 overflow-x-auto shadow-sm">
      <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
        <thead>
          <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
            <th className="px-5 py-4 font-medium">Customer Name</th>
            <th className="px-5 py-4 font-medium">Platform</th>
            <th className="px-5 py-4 font-medium">Mobile</th>
            <th className="px-5 py-4 font-medium">Location</th>
            <th className="px-5 py-4 font-medium">Lead Closure By</th>
            <th className="px-5 py-4 font-medium">Total Vehicles</th>
            <th className="px-5 py-4 font-medium">Pending Amount (₹)</th>
            <th className="px-5 py-4 font-medium">Renewal Date</th>
            <th className="px-5 py-4 font-medium text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-600">
          {customers.map((customer, index) => (
            <tr key={customer.id || index} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
              <td 
                className="px-5 py-4 font-medium text-gray-800 cursor-pointer hover:text-blue-600"
                onClick={() => onView(customer.id)}
              >
                {customer.name}
              </td>
              <td className="px-5 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {customer.platform || '-'}
                </span>
              </td>
              <td className="px-5 py-4">{customer.mobile}</td>
              <td className="px-5 py-4">{customer.location}</td>
              <td className="px-5 py-4">{customer.leadClosureBy}</td>
              <td className="px-5 py-4">{customer.vehicles?.length || 0}</td>
              <td className="px-5 py-4">
                {(() => {
                  const totalPending = customer.vehicles?.reduce((sum, v) => sum + (parseFloat(v.pendingAmount) || 0), 0) || 0;
                  return totalPending <= 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#e6f8ec] text-[#2ecc71] tracking-wide">
                      Paid
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium">₹{totalPending}</span>
                  );
                })()}
              </td>
              <td className="px-5 py-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tracking-wide ${
                  (customer.renewalDate === '-' || new Date(customer.renewalDate) < new Date()) ? 'bg-[#fee2e2] text-[#ef4444]' : 'bg-[#e6f8ec] text-[#2ecc71]'
                }`}>
                  {customer.renewalDate}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-center space-x-2">
                  <button onClick={() => onView(customer.id)} className="bg-[#3498db] text-white p-1.5 rounded shadow-sm hover:opacity-90 transition-opacity" title="View"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg></button>
                  <button onClick={() => onEdit(customer.id)} className="bg-[#f1c40f] text-white p-1.5 rounded shadow-sm hover:opacity-90 transition-opacity" title="Edit"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg></button>
                  <button onClick={() => onRenew(customer.id)} className="bg-[#2ecc71] text-white p-1.5 rounded shadow-sm hover:opacity-90 transition-opacity" title="Renew"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;
