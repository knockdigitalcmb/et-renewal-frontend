import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CustomerFilters from '../components/CustomerFilters';
import CustomerTable from '../components/CustomerTable';
import { useCustomer } from '../context/CustomerContext';
import { getExpiringCustomers } from '../utils/customerUtils';

const CustomerList = () => {
  const { customers, deleteCustomer } = useCustomer();
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
    if (window.confirm("Are you sure you want to delete this customer?")) {
      await deleteCustomer(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto bg-white rounded-md shadow-sm border border-gray-100 p-6">
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Customer List</h2>
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
                className="bg-[#3498db] text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                Download Sample Excel
              </button>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-[#f8f9fa] rounded-md p-6 text-center border border-gray-100 shadow-sm">
              <h3 className="text-gray-700 font-medium mb-3">Total Customers</h3>
              <p className="text-2xl font-bold text-gray-800">{totalCustomersCount}</p>
            </div>
            <div className="bg-[#fef9c3] rounded-md p-6 text-center shadow-sm">
              <h3 className="text-[#854d0e] font-medium mb-3">Pending Customers</h3>
              <p className="text-2xl font-bold text-[#854d0e]">{pendingCustomersCount}</p>
            </div>
            <div className="bg-[#fce8e8] rounded-md p-6 text-center shadow-sm">
              <h3 className="text-[#be123c] font-medium mb-3">Total Pending Amount</h3>
              <p className="text-2xl font-bold text-[#be123c]">₹{totalPendingAmount.toFixed(2)}</p>
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
              <span className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} entries
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
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
