import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../../context/CustomerContext';
import useDebounce from '../../hooks/useDebounce';
import { FiSearch, FiX } from 'react-icons/fi';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  
  const { customers } = useCustomer();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoized Search Logic
  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.trim().length === 0) return [];
    
    const searchLower = debouncedQuery.toLowerCase().trim();
    const hits = [];

    // Search rules:
    // Match Customer Name, Mobile (Primary/Alt), Vehicle Number, IMEI, SIM
    
    customers.forEach(customer => {
      const matchCustomerName = customer.name?.toLowerCase().includes(searchLower);
      const matchMobile = 
        customer.mobile?.includes(searchLower) ||
        customer.altMobile1?.includes(searchLower) ||
        customer.altMobile2?.includes(searchLower) ||
        customer.altMobile3?.includes(searchLower);

      if (customer.vehicles && customer.vehicles.length > 0) {
        customer.vehicles.forEach(vehicle => {
          const matchVehicleNo = vehicle.vehicleNo?.toLowerCase().includes(searchLower);
          const matchImei = vehicle.imei?.toLowerCase().includes(searchLower);
          const matchSim = vehicle.simNumber?.toLowerCase().includes(searchLower);

          if (matchCustomerName || matchMobile || matchVehicleNo || matchImei || matchSim) {
            hits.push({
              id: `${customer.id}-${vehicle.id}`,
              customerId: customer.id,
              customerName: customer.name,
              vehicleId: vehicle.id,
              vehicleNo: vehicle.vehicleNo,
              mobile: customer.mobile,
              imei: vehicle.imei || '-',
              sim: vehicle.simNumber || '-'
            });
          }
        });
      } else {
        // Customer with no vehicles
        if (matchCustomerName || matchMobile) {
          hits.push({
            id: `${customer.id}-none`,
            customerId: customer.id,
            customerName: customer.name,
            vehicleId: null,
            vehicleNo: 'No Vehicles',
            mobile: customer.mobile,
            imei: '-',
            sim: '-'
          });
        }
      }
    });

    // Limit to 20 results for performance
    return hits.slice(0, 20);
  }, [debouncedQuery, customers]);

  // Handle Dropdown Open State
  useEffect(() => {
    if (query.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [query, debouncedQuery]);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    // Route to EditCustomer focusing on the customer 
    navigate(`/customers/edit/${item.customerId}`);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full md:max-w-[400px] lg:max-w-[500px]" ref={dropdownRef}>
      <div className="relative flex items-center">
        <FiSearch className="absolute left-3 text-gray-400 dark:text-gray-500" size={16} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.trim().length > 0) setIsOpen(true); }}
          placeholder="Search Customer / Mobile / Vehicle / IMEI..."
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 pl-10 pr-8 py-2 rounded-xl text-[13px] border border-transparent shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
            className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiX size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 max-h-[400px] overflow-y-auto z-50 overflow-hidden">
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((item, index) => (
                <li 
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-50 dark:border-gray-700/50 last:border-0 transition-colors ${index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-[14px] text-gray-800 dark:text-white truncate pr-2">
                      {item.customerName}
                    </span>
                    <span className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                      {item.vehicleNo}
                    </span>
                  </div>
                  <div className="flex flex-col text-[12px] text-gray-500 dark:text-gray-400 space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-600 dark:text-gray-300">Mobile:</span>
                      <span>{item.mobile}</span>
                    </div>
                    {item.imei !== '-' && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600 dark:text-gray-300">IMEI:</span>
                        <span>{item.imei}</span>
                      </div>
                    )}
                    {item.sim !== '-' && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600 dark:text-gray-300">SIM:</span>
                        <span>{item.sim}</span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No matching customers found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
