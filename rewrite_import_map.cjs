const fs = require('fs');

const importComponent = `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { useCustomer } from '../../context/CustomerContext';
import { useModal } from '../../context/ModalContext';
import * as XLSX from 'xlsx';
import { regexPatterns, validatePastDate } from '../../utils/validationUtils';

const COLUMN_MAP = {
  "customer name": "customerName",
  "mobile number": "mobile",
  "email": "email",
  "location": "location",
  "lead closure by": "leadClosureBy",
  "vehicle number": "vehicleNumber",
  "vehicle no": "vehicleNumber",
  "device model": "deviceModel",
  "imei number": "imei",
  "sim number": "simNumber",
  "platform": "platform",
  "device price": "devicePrice",
  "sim price": "simPrice",
  "total amount": "totalPayment",
  "pending amount": "pendingAmount",
  "installation person": "installationPerson",
  "installation date": "installationDate",
  "expiry date": "expiryDate",
  "validity": "validity",
  "payment mode": "paymentMode",
  "amount paid": "amountPaid",
  "vehicle type": "vehicleType"
};

const normalizeKey = (key) => key.toLowerCase().trim().replace(/\\s+/g, ' ');

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
        const existingVehicles = new Set();
        customers.forEach(c => {
          if (c.vehicles) c.vehicles.forEach(v => existingVehicles.add(v.vehicleNo));
        });
        
        let count = 0;
        let skipped = 0;
        let errors = [];
        
        for (let i = 0; i < json.length; i++) {
          const rawRow = json[i];
          const rowNum = i + 2; // Excel row number (1-indexed + header)

          // 1. Normalize and map keys
          const normalizedRow = {};
          for (const key of Object.keys(rawRow)) {
            const normalizedKey = normalizeKey(key);
            const mappedKey = COLUMN_MAP[normalizedKey];
            if (mappedKey) {
              normalizedRow[mappedKey] = rawRow[key];
            } else {
               // Fallback: If it's already an exact camelCase match
               normalizedRow[key] = rawRow[key];
            }
          }

          console.log(\`Import Mapped Row \${rowNum}:\`, normalizedRow);

          // 2. Extract Fields safely
          const rowVehicle = String(normalizedRow.vehicleNumber || '').trim();
          const rowPlatform = String(normalizedRow.platform || '').trim();
          const rowVehicleType = String(normalizedRow.vehicleType || '').trim();
          const rowImei = String(normalizedRow.imei || '').trim();
          const rowSim = String(normalizedRow.simNumber || '').trim();
          const rowDeviceModel = String(normalizedRow.deviceModel || '').trim();
          
          const rowDevicePrice = parseFloat(normalizedRow.devicePrice) || 0;
          const rowSimPrice = parseFloat(normalizedRow.simPrice) || 0;
          const rowAmountPaid = parseFloat(normalizedRow.amountPaid) || 0;
          const rowTotalPayment = parseFloat(normalizedRow.totalPayment) || (rowDevicePrice + rowSimPrice);
          const rowPendingAmount = parseFloat(normalizedRow.pendingAmount) || (rowTotalPayment - rowAmountPaid);
          const rowPaymentMode = String(normalizedRow.paymentMode || '').trim();
          
          const rowInstallPerson = String(normalizedRow.installationPerson || '').trim();
          const rowClosureBy = String(normalizedRow.leadClosureBy || '').trim();
          const rowInstallDate = String(normalizedRow.installationDate || '').trim();
          const rowValidity = String(normalizedRow.validity || '').trim();
          const rowExpiryDate = String(normalizedRow.expiryDate || '').trim();

          const rowName = String(normalizedRow.customerName || '').trim();
          const rowMobile = String(normalizedRow.mobile || '').trim();
          const rowEmail = String(normalizedRow.email || '').trim();
          const rowLocation = String(normalizedRow.location || '').trim();

          // 3. Strict Validations
          if (!rowName) { errors.push(\`Row \${rowNum}: Customer Name is missing\`); skipped++; continue; }
          if (!rowMobile) { errors.push(\`Row \${rowNum}: Mobile Number is missing\`); skipped++; continue; }
          if (!rowVehicle) { errors.push(\`Row \${rowNum}: Vehicle Number is missing\`); skipped++; continue; }
          if (!rowImei) { errors.push(\`Row \${rowNum}: IMEI Number is missing\`); skipped++; continue; }
          if (!rowSim) { errors.push(\`Row \${rowNum}: SIM Number is missing\`); skipped++; continue; }

          if (!regexPatterns.mobile.test(rowMobile)) { errors.push(\`Row \${rowNum}: Invalid Mobile Number format\`); skipped++; continue; }
          if (!regexPatterns.vehicleNumber.test(rowVehicle)) { errors.push(\`Row \${rowNum}: Invalid Vehicle Number format\`); skipped++; continue; }
          
          if (existingMobiles.has(rowMobile)) { errors.push(\`Row \${rowNum}: Mobile Number \${rowMobile} already exists\`); skipped++; continue; }
          if (existingVehicles.has(rowVehicle)) { errors.push(\`Row \${rowNum}: Vehicle Number \${rowVehicle} already exists\`); skipped++; continue; }

          existingMobiles.add(rowMobile);
          existingVehicles.add(rowVehicle);

          const formattedData = {
            customerName: rowName,
            mobileNumber: rowMobile,
            email: rowEmail,
            location: rowLocation || '-',
            leadClosureBy: rowClosureBy || '-',
            
            vehicleNumber: rowVehicle,
            platform: rowPlatform || '-',
            vehicleType: rowVehicleType || '-',
            imeiNumber: rowImei,
            simNumber: rowSim,
            deviceModel: rowDeviceModel || '-',
            
            devicePrice: rowDevicePrice,
            simPrice: rowSimPrice,
            totalPaymentReceived: rowTotalPayment,
            amountPaid: rowAmountPaid,
            pendingAmount: rowPendingAmount > 0 ? rowPendingAmount : 0,
            paymentMode: rowPaymentMode || '-',
            
            installationPerson: rowInstallPerson || '-',
            installationDate: rowInstallDate || '-',
            validity: rowValidity || '12',
            expiryDate: rowExpiryDate || '-'
          };
          
          await addCustomer(formattedData);
          count++;
        }
        
        setLoading(false);

        let message = \`\${count} records imported successfully.\\n\${skipped} records skipped.\\n\\n\`;
        if (errors.length > 0) {
          message += "Errors:\\n" + errors.slice(0, 10).join("\\n");
          if (errors.length > 10) message += \`\\n...and \${errors.length - 10} more errors.\`;
        }

        showModal({
          type: count > 0 ? 'success' : 'error',
          title: count > 0 ? 'Import Successful' : 'Import Failed',
          message: message,
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
`;

fs.writeFileSync('src/pages/customer/ImportCustomers.jsx', importComponent);
console.log('Successfully updated ImportCustomers.jsx with COLUMN_MAP logic');
