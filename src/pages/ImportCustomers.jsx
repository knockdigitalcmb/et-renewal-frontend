import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCustomer } from '../context/CustomerContext';
import { useModal } from '../context/ModalContext';
import * as XLSX from 'xlsx';
import { regexPatterns, validatePastDate } from '../utils/validationUtils';

const ImportCustomers = () => {
  const navigate = useNavigate();
  const { customers, addCustomer } = useCustomer();
  const { showModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      showModal({ type: 'warning', title: 'File Required', message: 'Please choose an excel file to import.' });
      return;
    }
    
    setLoading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        const existingMobiles = new Set(customers.map(c => c.mobile));
        const existingVehicles = new Set(customers.map(c => c.vehicleNo));
        
        let count = 0;
        let skipped = 0;
        
        for (const row of json) {
          const rowMobile = String(row['Mobile Number'] || row['Mobile'] || row.mobileNumber || '-').trim();
          const rowVehicle = String(row['Vehicle No'] || row['Vehicle Number'] || row.vehicleNo || '-').trim();
          const rowName = String(row['Customer Name'] || row['Name'] || row.customerName || 'Imported Customer').trim();
          
          // Data Integrity Validation
          let isValid = true;

          // Validate required formatting
          if (rowMobile !== '-' && !regexPatterns.mobile.test(rowMobile)) isValid = false;
          if (rowVehicle !== '-' && !regexPatterns.vehicleNumber.test(rowVehicle)) isValid = false;
          if (!regexPatterns.customerName.test(rowName)) isValid = false;
          
          const rowInstallDate = row['Installation Date'] || row.installationDate || '-';
          if (rowInstallDate !== '-' && validatePastDate(rowInstallDate) !== true) isValid = false;

          if (!isValid) {
            skipped++;
            continue;
          }

          if ((rowMobile !== '-' && existingMobiles.has(rowMobile)) || 
              (rowVehicle !== '-' && existingVehicles.has(rowVehicle))) {
            skipped++;
            continue;
          }

          if (rowMobile !== '-') existingMobiles.add(rowMobile);
          if (rowVehicle !== '-') existingVehicles.add(rowVehicle);

          const formattedData = {
            customerName: rowName,
            mobileNumber: rowMobile,
            email: row['Email'] || row.email || '',
            location: row['Location'] || row.location || '-',
            leadClosureBy: row['Lead Closure By'] || row['Closure By'] || row.leadClosureBy || '-',
            vehicleNo: rowVehicle,
            pendingAmount: parseFloat(row['Pending Amount']) || parseFloat(row['Pending']) || 0,
            expiryDate: row['Expiry Date'] || row['Renewal Date'] || row.expiryDate || '-',
            installationDate: row['Installation Date'] || row.installationDate || '-'
          };
          
          await addCustomer(formattedData);
          count++;
        }
        
        setLoading(false);
        showModal({
          type: 'success',
          title: 'Import Successful',
          message: `${count} records imported.\n${skipped} duplicate or invalid records skipped.`,
          buttons: [
            { text: 'View Customers', style: 'primary', onClick: () => navigate('/customers') },
            { text: 'Close', style: 'secondary' }
          ]
        });
      };
      
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      showModal({ type: 'error', title: 'Import Failed', message: 'Error parsing the file.' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col">
      <Header />
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Bulk Import Customers</h2>
          <p className="text-sm text-gray-500 mb-8">Upload an Excel (.xlsx) or CSV file to import multiple customers at once.</p>
          
          <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg mb-8 hover:bg-gray-50 transition-colors">
            <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={() => navigate('/customers')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleImport}
              disabled={loading}
              className="flex-1 bg-[#2ecc71] hover:bg-[#27ae60] text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-70"
            >
              {loading ? 'Importing...' : 'Upload & Import'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
export default ImportCustomers;
