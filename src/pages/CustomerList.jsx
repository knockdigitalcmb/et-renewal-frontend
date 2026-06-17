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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
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
