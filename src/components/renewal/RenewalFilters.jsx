import React from 'react';

const RenewalFilters = ({ onSearch, onExport, onDateRangeChange }) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:space-x-3 flex-1 flex-wrap">
        <input 
          type="text" 
          placeholder="Search Customer or Vehicle No..." 
          onChange={(e) => onSearch(e.target.value)}
          className="w-full md:max-w-[300px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <div className="flex flex-col md:flex-row gap-3 md:space-x-3">
          <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">From:</label>
          <input 
            type="date" 
            onChange={(e) => onDateRangeChange('from', e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">To:</label>
          <input 
            type="date" 
            onChange={(e) => onDateRangeChange('to', e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
          <select className="w-full md:w-auto px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 transition-colors">
            <option>All Payment Modes</option>
                  <option value="ET Gpay">ET Gpay</option>
                  <option value="ET Phonepe">ET Phonepe</option>
                  <option value="ET Paytm">ET Paytm</option>
                  <option value="ET Account">ET Account</option>
                  <option value="ET Cheque">ET Cheque</option>
                  <option value="8002 Gpay">8002 Gpay</option>
                  <option value="8002 Paytm">8002 Paytm</option>
                  <option value="8002 PhonePe">8002 PhonePe</option>
                  <option value="8002 Account">8002 Account</option>
                  <option value="WATI Gpay">WATI Gpay</option>
                  <option value="WATI Paytm">WATI Paytm</option>
                  <option value="WATI PhonePe">WATI PhonePe</option>
                  <option value="WATI Account">WATI Account</option>
                  <option value="Cash">Cash</option>
                  <option value="CC Payment Gateway">CC Payment Gateway</option>
          </select>
          <select className="w-full md:w-auto px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 transition-colors">
            <option>All Validity</option>
              <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 months">12 months</option>
                  <option value="13 months">13 months</option>
                  <option value="14 months">14 months</option>
                  <option value="15 months">15 months</option>
                  <option value="24 months">24 months</option>
                  <option value="27 months">27 months</option>
                  <option value="36 months">36 months</option>
                  <option value="48 months">48 months</option>
                  <option value="60 months">60 months</option>
          </select>
        </div>
      </div>
      <div className="w-full md:w-auto">
        <button 
          onClick={onExport}
          className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default RenewalFilters;
