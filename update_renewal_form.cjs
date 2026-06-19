const fs = require('fs');

// 1. Update CustomerRenewal.jsx
let renewalFile = fs.readFileSync('src/pages/renewal/CustomerRenewal.jsx', 'utf-8');

// Add `renewalAmount` and `amountPaid` watches
renewalFile = renewalFile.replace(
  `const notes = useWatch({ control, name: 'notes' });`,
  `const notes = useWatch({ control, name: 'notes' });
  const renewalAmount = useWatch({ control, name: 'renewalAmount' });
  const amountPaid = useWatch({ control, name: 'amountPaid' });

  useEffect(() => {
    if (renewalAmount !== undefined && !dirtyFields.amountPaid) {
      setValue('amountPaid', renewalAmount);
    }
  }, [renewalAmount, setValue, dirtyFields.amountPaid]);

  const pendingAmount = Math.max(0, (parseFloat(renewalAmount) || 0) - (parseFloat(amountPaid) || 0));`
);

// Update payload in onSubmit
renewalFile = renewalFile.replace(
  `amount: \`₹\${trimmedData.renewalAmount}\`,`,
  `renewalAmount: parseFloat(trimmedData.renewalAmount) || 0,
      amountPaid: parseFloat(trimmedData.amountPaid) || 0,
      pendingAmount: Math.max(0, (parseFloat(trimmedData.renewalAmount) || 0) - (parseFloat(trimmedData.amountPaid) || 0)),`
);

// Layout updates
const newInputs = `<div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Paid (₹) *</label>
                  <NumericInput {...register('amountPaid', { 
                      required: 'Amount Paid is required',
                      min: { value: 0, message: 'Cannot be negative' },
                      validate: value => (parseFloat(value) || 0) <= (parseFloat(renewalAmount) || 0) || 'Amount Paid cannot exceed Renewal Amount'
                    })} 
                    className={getInputClass('amountPaid')} 
                  defaultToZero />
                  {errors.amountPaid && <p className="text-red-500 text-xs mt-1">{errors.amountPaid.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pending Amount (₹)</label>
                  <div className="w-full border border-gray-200 dark:border-gray-700 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium cursor-not-allowed transition-colors">
                    ₹{pendingAmount}
                  </div>
                </div>`;

renewalFile = renewalFile.replace(
  `{errors.renewalAmount && <p className="text-red-500 text-xs mt-1">{errors.renewalAmount.message}</p>}
                </div>`,
  `{errors.renewalAmount && <p className="text-red-500 text-xs mt-1">{errors.renewalAmount.message}</p>}
                </div>
                ${newInputs}`
);

fs.writeFileSync('src/pages/renewal/CustomerRenewal.jsx', renewalFile);


// 2. Update RenewalTable.jsx
let rtFile = fs.readFileSync('src/components/renewal/RenewalTable.jsx', 'utf-8');

rtFile = rtFile.replace(
  `<th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('amount')}>Amount</th>`,
  `<th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('renewalAmount')}>Renewal Amount</th>
            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('amountPaid')}>Amount Paid</th>
            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('pendingAmount')}>Pending Amount</th>`
);

rtFile = rtFile.replace(
  `<td className="px-6 py-4 text-gray-600 dark:text-gray-400">{row.amount}</td>`,
  `<td className="px-6 py-4 text-gray-600 dark:text-gray-400">₹{row.renewalAmount || 0}</td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">₹{row.amountPaid || 0}</td>
              <td className="px-6 py-4">
                {row.pendingAmount <= 0 ? (
                  <span className="bg-[#d4edda] dark:bg-green-900/30 text-[#155724] dark:text-green-400 px-2 py-1 rounded text-[12px] font-medium tracking-wide">Paid</span>
                ) : (
                  <span className="text-red-500 dark:text-red-400 font-medium text-[14px]">₹{row.pendingAmount}</span>
                )}
              </td>`
);

fs.writeFileSync('src/components/renewal/RenewalTable.jsx', rtFile);

// 3. Update RenewalHistory.jsx CSV Export
let rhFile = fs.readFileSync('src/pages/renewal/RenewalHistory.jsx', 'utf-8');

rhFile = rhFile.replace(
  `csvContent += "Customer Name,Vehicle No,Renewal Date,Amount,Validity,Old Expiry,New Expiry,Payment Mode\\n";
    filteredData.forEach(row => {
      csvContent += \`"\${row.customerName}","\${row.vehicleNo}","\${row.renewalDate}","\${row.amount}","\${row.validity}","\${row.oldExpiry}","\${row.newExpiry}","\${row.paymentMode}"\\n\`;
    });`,
  `csvContent += "Customer Name,Vehicle No,Renewal Date,Renewal Amount,Amount Paid,Pending Amount,Validity,Old Expiry,New Expiry,Payment Mode\\n";
    filteredData.forEach(row => {
      csvContent += \`"\${row.customerName}","\${row.vehicleNo}","\${row.renewalDate}","\${row.renewalAmount}","\${row.amountPaid}","\${row.pendingAmount}","\${row.validity}","\${row.oldExpiry}","\${row.newExpiry}","\${row.paymentMode}"\\n\`;
    });`
);

fs.writeFileSync('src/pages/renewal/RenewalHistory.jsx', rhFile);

// 4. Update ViewCustomer.jsx Financial Summary
let vcFile = fs.readFileSync('src/pages/customer/ViewCustomer.jsx', 'utf-8');

const financialSummary = `
            {/* Renewal Financial Summary */}
            {(() => {
              const custRenewals = require('react').useContext(require('../../context/CustomerContext').CustomerContext).renewals.filter(r => r.customerId === customer.id || r.customer === customer.name);
              const totalRenewal = custRenewals.reduce((sum, r) => sum + (parseFloat(r.renewalAmount) || 0), 0);
              const totalPaid = custRenewals.reduce((sum, r) => sum + (parseFloat(r.amountPaid) || 0), 0);
              const totalPending = custRenewals.reduce((sum, r) => sum + (parseFloat(r.pendingAmount) || 0), 0);
              
              if (custRenewals.length === 0) return null;

              return (
                <div className="mb-8">
                  <h4 className="text-[1rem] font-bold text-gray-800 dark:text-gray-200 mb-4">Renewal Financial Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-100 dark:border-blue-800">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">Total Renewal Amount</p>
                      <p className="text-xl font-bold text-blue-900 dark:text-blue-300">₹{totalRenewal}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-100 dark:border-green-800">
                      <p className="text-sm text-green-600 dark:text-green-400 font-semibold mb-1">Total Paid Amount</p>
                      <p className="text-xl font-bold text-green-900 dark:text-green-300">₹{totalPaid}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-100 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-1">Total Pending Amount</p>
                      <p className="text-xl font-bold text-red-900 dark:text-red-300">₹{totalPending}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
`;

vcFile = vcFile.replace(
  `            {/* Vehicle List */}`,
  `${financialSummary}\n            {/* Vehicle List */}`
);

fs.writeFileSync('src/pages/customer/ViewCustomer.jsx', vcFile);

// 5. Update Dashboard.jsx Pending Payments
let dFile = fs.readFileSync('src/pages/dashboard/Dashboard.jsx', 'utf-8');

dFile = dFile.replace(
  `      } else {
        // Fallback for flat structure
        pendingPayments += (parseFloat(customer.pendingAmount) || 0);
      }
    });`,
  `      } else {
        // Fallback for flat structure
        pendingPayments += (parseFloat(customer.pendingAmount) || 0);
      }
    });

    renewals.forEach(r => {
      pendingPayments += (parseFloat(r.pendingAmount) || 0);
    });`
);

fs.writeFileSync('src/pages/dashboard/Dashboard.jsx', dFile);

console.log('Successfully updated renewal files!');
