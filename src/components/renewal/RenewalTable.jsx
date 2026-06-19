import React, { useState } from 'react';
import RenewalBadge from './RenewalBadge';
import { useSettings } from '../../context/SettingsContext';

const RenewalTable = ({ data, onCustomerClick }) => {
  const [sortConfig, setSortConfig] = useState(null);
  const { formatDate } = useSettings();

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">No renewals found.</div>;
  }

  return (
    <div className="w-full overflow-x-auto border border-gray-100 dark:border-gray-700 rounded transition-colors duration-200">
      <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
        <thead>
          <tr className="bg-[#f8f9fa] dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 text-sm border-b border-gray-100 dark:border-gray-700">
            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('customer')}>Customer</th>
            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('vehicleNo')}>Vehicle No.</th>
            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('renewalDate')}>Renewal Date</th>
            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('renewalAmount')}>Renewal Amount</th>
            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('amountPaid')}>Amount Paid</th>
            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('pendingAmount')}>Pending Amount</th>
            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('validity')}>Validity</th>
            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('oldExpiry')}>Old Expiry</th>
            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('newExpiry')}>New Expiry</th>
            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('paymentMode')}>Payment Mode</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700 dark:text-gray-300">
          {sortedData.map((row, index) => (
            <tr key={index} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <td className="px-6 py-4">
                <button 
                  onClick={() => onCustomerClick(row.viewCustomerId)}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium bg-transparent border-none p-0 cursor-pointer text-sm"
                >
                  {row.customerName}
                </button>
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{row.vehicleNo}</td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(row.renewalDate)}</td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">₹{row.renewalAmount || 0}</td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">₹{row.amountPaid || 0}</td>
              <td className="px-6 py-4">
                {row.pendingAmount <= 0 ? (
                  <span className="bg-[#d4edda] dark:bg-green-900/30 text-[#155724] dark:text-green-400 px-2 py-1 rounded text-[12px] font-medium tracking-wide">Paid</span>
                ) : (
                  <span className="text-red-500 dark:text-red-400 font-medium text-[14px]">₹{row.pendingAmount}</span>
                )}
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{row.validity}</td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(row.oldExpiry)}</td>
              <td className="px-6 py-4">
                <RenewalBadge date={row.newExpiry} />
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{row.paymentMode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RenewalTable;
