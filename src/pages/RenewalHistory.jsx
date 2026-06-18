import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import RenewalFilters from '../components/RenewalFilters';
import RenewalTable from '../components/RenewalTable';

import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';

const RenewalHistory = () => {
  const navigate = useNavigate();
  const { renewals, getCustomer } = useCustomer();
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Pagination state
  const [currentPage, setPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    // Map to include real customer name and ID for viewing
    let result = renewals.map(item => {
      const custId = item.customerId || item.customer;
      const c = getCustomer(custId);
      return {
        ...item,
        customerName: c ? c.name : item.customer,
        viewCustomerId: c ? c.id : custId
      };
    });
    
    if (fromDate) {
      result = result.filter(item => item.renewalDate >= fromDate);
    }
    if (toDate) {
      result = result.filter(item => item.renewalDate <= toDate);
    }

    if (searchTerm) {
      const lowerQuery = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.customerName.toLowerCase().includes(lowerQuery) || 
        item.vehicleNo.toLowerCase().includes(lowerQuery)
      );
    }
    return result;
  }, [renewals, getCustomer, searchTerm, fromDate, toDate]);

  const handleSearch = (query) => {
    setSearchTerm(query);
    setPage(1);
  };

  const handleDateRangeChange = (type, value) => {
    if (type === 'from') setFromDate(value);
    if (type === 'to') setToDate(value);
    setPage(1);
  };

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Customer Name,Vehicle No,Renewal Date,Amount,Validity,Old Expiry,New Expiry,Payment Mode\n";
    filteredData.forEach(row => {
      csvContent += `"${row.customerName}","${row.vehicleNo}","${row.renewalDate}","${row.amount}","${row.validity}","${row.oldExpiry}","${row.newExpiry}","${row.paymentMode}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "renewal_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCustomerClick = (id) => {
    navigate(`/customers/view/${id}`);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col">
      <Header />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="bg-white rounded-md shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Renewal History</h2>
            
            <RenewalFilters onSearch={handleSearch} onExport={handleExport} onDateRangeChange={handleDateRangeChange} />

            <RenewalTable data={paginatedData} onCustomerClick={handleCustomerClick} />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-4">
                <span className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default RenewalHistory;
