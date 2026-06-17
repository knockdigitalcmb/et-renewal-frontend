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
                  <button onClick={() => onRenew(customer.id)} className="bg-[#9b59b6] text-white p-1.5 rounded shadow-sm hover:opacity-90 transition-opacity" title="Renew"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"></path></svg></button>
                  <button onClick={() => onDelete(customer.id)} className="bg-[#e74c3c] text-white p-1.5 rounded shadow-sm hover:opacity-90 transition-opacity" title="Delete"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg></button>
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
