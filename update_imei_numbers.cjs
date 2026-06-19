const fs = require('fs');

let fileContent = fs.readFileSync('src/pages/devices/IMEINumbers.jsx', 'utf-8');

// Imports
fileContent = fileContent.replace(
  `import { MdSearch } from 'react-icons/md';`,
  `import { MdSearch, MdEdit, MdVisibility, MdDelete } from 'react-icons/md';\nimport { useNavigate } from 'react-router-dom';\nimport { useImei } from '../../context/ImeiContext';\nimport { useModal } from '../../context/ModalContext';\nimport AddImeiModal from '../../components/devices/AddImeiModal';`
);

// State and Context
fileContent = fileContent.replace(
  `const { customers } = useCustomer();`,
  `const { customers, updateVehicle } = useCustomer();\n  const { imeis, deleteImei } = useImei();\n  const { showModal } = useModal();\n  const navigate = useNavigate();\n  const [isAddModalOpen, setIsAddModalOpen] = useState(false);`
);

// allImeis logic
fileContent = fileContent.replace(
  `const allImeis = useMemo(() => {
    const list = [];
    customers.forEach(customer => {
      if (customer.vehicles && Array.isArray(customer.vehicles)) {
        customer.vehicles.forEach(vehicle => {
          if (vehicle.imei) {
            list.push({
              imei: vehicle.imei,
              customerName: customer.name,
              vehicleNo: vehicle.vehicleNo,
              deviceModel: vehicle.deviceModel || 'N/A',
              status: vehicle.status || 'Active'
            });
          }
        });
      }
    });
    return list;
  }, [customers]);`,
  `const allImeis = useMemo(() => {
    const list = [];
    // 1. Standalone
    imeis.forEach(imei => {
      list.push({
        id: imei.id,
        isLegacy: false,
        customerId: imei.customerId,
        imei: imei.imei,
        customerName: imei.customerName,
        vehicleNo: imei.vehicleNumber || 'Unassigned',
        deviceModel: imei.deviceModel,
        status: imei.status
      });
    });

    // 2. Legacy
    const explicitImeiNumbers = new Set(imeis.map(i => i.imei));
    customers.forEach(customer => {
      if (customer.vehicles && Array.isArray(customer.vehicles)) {
        customer.vehicles.forEach(vehicle => {
          if (vehicle.imei && !explicitImeiNumbers.has(vehicle.imei)) {
            list.push({
              id: vehicle.id,
              isLegacy: true,
              customerId: customer.id,
              imei: vehicle.imei,
              customerName: customer.name,
              vehicleNo: vehicle.vehicleNo,
              deviceModel: vehicle.deviceModel || 'N/A',
              status: vehicle.status || 'Active'
            });
          }
        });
      }
    });
    return list;
  }, [customers, imeis]);`
);

// Filter logic update (robustness)
fileContent = fileContent.replace(
  `v.imei.toLowerCase().includes(searchStr) ||
        v.customerName.toLowerCase().includes(searchStr) ||
        v.vehicleNo.toLowerCase().includes(searchStr) ||
        v.deviceModel.toLowerCase().includes(searchStr)`,
  `v.imei?.toLowerCase().includes(searchStr) ||
        v.customerName?.toLowerCase().includes(searchStr) ||
        v.vehicleNo?.toLowerCase().includes(searchStr) ||
        v.deviceModel?.toLowerCase().includes(searchStr)`
);

// Handlers
fileContent = fileContent.replace(
  `return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">`,
  `const handleDelete = (item) => {
    showModal({
      type: 'confirm',
      title: 'Delete IMEI Number',
      message: 'Are you sure you want to delete this IMEI record?',
      buttons: [
        { text: 'Cancel', style: 'secondary' },
        { 
          text: 'Delete', 
          style: 'danger', 
          onClick: async () => {
            if (item.isLegacy) {
              await updateVehicle(item.id, { imei: '' });
            } else {
              deleteImei(item.id);
            }
            showModal({
              type: 'success',
              title: 'Success',
              message: 'IMEI deleted successfully'
            });
          }
        }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">`
);

// Add button
fileContent = fileContent.replace(
  `<div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">IMEI Numbers</h1>
            <p className="text-sm text-gray-500">Global overview of all assigned IMEI numbers</p>
          </div>
          <div className="relative w-full md:w-64">`,
  `<div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">IMEI Numbers</h1>
            <p className="text-sm text-gray-500">Global overview of all assigned IMEI numbers</p>
          </div>
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">`
);

fileContent = fileContent.replace(
  `className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>`,
  `className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#4361ee] hover:bg-[#3b55d1] text-white px-5 py-2 rounded font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            + Add IMEI Number
          </button>
          </div>
        </div>`
);

// Table column replace
fileContent = fileContent.replace(
  `<th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>`,
  `<th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>`
);

// Table rows
fileContent = fileContent.replace(
  `                        <span className={\`px-3 py-1 rounded-full text-xs font-bold \${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>`,
  `                        <span className={\`px-3 py-1 rounded-full text-xs font-bold \${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(\`/devices/imei-numbers/view/\${item.id}\`)}
                          className="text-[#3498db] hover:text-[#2980b9] p-1.5 rounded hover:bg-blue-50 transition-colors mr-2"
                          title="View IMEI"
                        >
                          <MdVisibility className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(\`/devices/imei-numbers/edit/\${item.id}\`)}
                          className="text-[#f39c12] hover:text-[#e67e22] p-1.5 rounded hover:bg-orange-50 transition-colors mr-2"
                          title="Edit IMEI"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item)}
                          className="text-[#e74c3c] hover:text-[#c0392b] p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete IMEI"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>`
);

// Empty span
fileContent = fileContent.replace(
  `<td colSpan="5" className="px-6 py-8 text-center text-gray-500">`,
  `<td colSpan="6" className="px-6 py-8 text-center text-gray-500">`
);

// Modal injection
fileContent = fileContent.replace(
  `      </main>
    </div>`,
  `      </main>
      
      <AddImeiModal 
        isOpen={isAddModalOpen} 
        onClose={(success) => {
          setIsAddModalOpen(false);
          if (success === true) {
            showModal({
              type: 'success',
              title: 'Success',
              message: 'IMEI Number added successfully',
            });
          }
        }} 
      />
    </div>`
);

fs.writeFileSync('src/pages/devices/IMEINumbers.jsx', fileContent);
console.log('Successfully updated IMEINumbers.jsx');
