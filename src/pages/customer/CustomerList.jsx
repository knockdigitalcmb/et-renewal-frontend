import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import CustomerFilters from '../../components/customer/CustomerFilters';
import CustomerTable from '../../components/customer/CustomerTable';
import { useCustomer } from '../../context/CustomerContext';
import { useModal } from '../../context/ModalContext';
import { getExpiringCustomers } from '../../utils/customerUtils';
import * as XLSX from 'xlsx';

const CustomerList = () => {
  const { customers, deleteCustomer } = useCustomer();
  const { showModal } = useModal();
  const location = useLocation();
  const navigate = useNavigate();

  const totalCustomersCount = customers.length;
  let pendingCustomersCount = 0;
  let totalPendingAmount = 0;

  customers.forEach(c => {
    const totalPending = c.vehicles?.reduce((sum, v) => sum + (parseFloat(v.pendingAmount) || 0), 0) || 0;
    if (totalPending > 0) {
      pendingCustomersCount++;
      totalPendingAmount += totalPending;
    }
  });

  // Parse query params
  const searchParams = new URLSearchParams(location.search);
  const paymentFilterParam = searchParams.get('payment');
  const expiryFilterParam = searchParams.get('expiry');

  const initialFilter = paymentFilterParam === 'pending' ? 'Pending Payments' : 'All Customers';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(initialFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCustomers = useMemo(() => {
    let result = customers;

    if (filterType === 'Pending Payments') {
      result = result.filter(c => {
        const totalPending = c.vehicles?.reduce((sum, v) => sum + (parseFloat(v.pendingAmount) || 0), 0) || 0;
        return totalPending > 0;
      });
    } else if (filterType === 'Fully Paid Customers') {
      result = result.filter(c => {
        const totalPending = c.vehicles?.reduce((sum, v) => sum + (parseFloat(v.pendingAmount) || 0), 0) || 0;
        return totalPending <= 0;
      });
    }

    if (expiryFilterParam === '30days') {
      result = getExpiringCustomers(result);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(lower) || 
        c.mobile.includes(lower) ||
        c.vehicleNo.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [customers, filterType, expiryFilterParam, searchTerm]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedData = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    showModal({
      type: 'confirm',
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer? All their vehicles will also be deleted.',
      buttons: [
        { text: 'Cancel', style: 'secondary' },
        { 
          text: 'Delete', 
          style: 'danger', 
          onClick: async () => {
            await deleteCustomer(id);
          }
        }
      ]
    });
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        "Customer Name": "John Doe",
        "Mobile Number": "9876543210",
        "Alternate Mobile": "9876543211",
        "Email": "john@example.com",
        "Location": "Chennai",
        "Vehicle Number": "TN01AB1234",
        "Platform": "Tracco",
        "Vehicle Type": "Car",
        "IMEI Number": "123456789012345",
        "SIM Number": "1234567890",
        "Device Model": "GT06N",
        "Device Price": 2500,
        "SIM Price": 500,
        "Total Payment": 3000,
        "Amount Paid": 3000,
        "Pending Amount": 0,
        "Payment Mode": "ET Gpay",
        "Installation Person": "Raja",
        "Lead Closure By": "Admin",
        "Installation Date": "2024-01-01",
        "Validity": "12 months",
        "Expiry Date": "2025-01-01"
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    const colWidths = [
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Sample Data");
    XLSX.writeFile(wb, "Customer_Import_Sample.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <Header />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Customer List</h2>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <button 
                onClick={() => navigate('/customers/add')}
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                + New Customer / Vehicle
              </button>
              <button 
                onClick={() => navigate('/customers/import')}
                className="bg-[#2ecc71] text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-600 transition-colors shadow-sm"
              >
                + Import Customers
              </button>
              <button 
                onClick={handleDownloadSample}
                className="bg-[#3498db] text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                Download Sample Excel
              </button>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-[#f8f9fa] dark:bg-gray-700 rounded-md p-6 text-center border border-gray-100 dark:border-gray-600 shadow-sm transition-colors duration-200">
              <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-3">Total Customers</h3>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalCustomersCount}</p>
            </div>
            <div className="bg-[#fef9c3] dark:bg-yellow-900/20 rounded-md p-6 text-center shadow-sm transition-colors duration-200 border border-transparent dark:border-yellow-900/50">
              <h3 className="text-[#854d0e] dark:text-yellow-500 font-medium mb-3">Pending Customers</h3>
              <p className="text-2xl font-bold text-[#854d0e] dark:text-yellow-400">{pendingCustomersCount}</p>
            </div>
            <div className="bg-[#fce8e8] dark:bg-red-900/20 rounded-md p-6 text-center shadow-sm transition-colors duration-200 border border-transparent dark:border-red-900/50">
              <h3 className="text-[#be123c] dark:text-red-400 font-medium mb-3">Total Pending Amount</h3>
              <p className="text-2xl font-bold text-[#be123c] dark:text-red-300">₹{totalPendingAmount.toFixed(2)}</p>
            </div>
          </div>

          <CustomerFilters onSearch={handleSearch} onFilterChange={handleFilterChange} />
          
          <CustomerTable 
            customers={paginatedData} 
            onDelete={handleDelete}
            onView={(id) => navigate(`/customers/view/${id}`)}
            onEdit={(id) => navigate(`/customers/edit/${id}`)}
            onRenew={(id) => navigate(`/customers/renewal/${id}`)}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} entries
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerList;
