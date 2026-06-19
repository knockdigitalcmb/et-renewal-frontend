const fs = require('fs');

let fileContent = fs.readFileSync('src/pages/devices/SIMNumbers.jsx', 'utf-8');

// Imports
fileContent = fileContent.replace(
  `import { useCustomer } from '../../context/CustomerContext';`,
  `import { useCustomer } from '../../context/CustomerContext';\nimport { useSim } from '../../context/SimContext';\nimport { useModal } from '../../context/ModalContext';\nimport AddSIMModal from '../../components/devices/AddSIMModal';`
);

// State and Context
fileContent = fileContent.replace(
  `const { customers } = useCustomer();`,
  `const { customers } = useCustomer();\n  const { sims } = useSim();\n  const { showModal } = useModal();\n  const [isAddModalOpen, setIsAddModalOpen] = useState(false);`
);

// allSims logic
fileContent = fileContent.replace(
  `const allSims = useMemo(() => {
    const list = [];
    customers.forEach(customer => {
      if (customer.vehicles && Array.isArray(customer.vehicles)) {
        customer.vehicles.forEach(vehicle => {
          if (vehicle.simNumber) {
            list.push({
              simNumber: vehicle.simNumber,
              customerName: customer.name,
              vehicleNo: vehicle.vehicleNo,
              network: 'N/A', // Network is not currently captured in the DB
              status: vehicle.status || 'Active'
            });
          }
        });
      }
    });
    return list;
  }, [customers]);`,
  `const allSims = useMemo(() => {
    const list = [];
    // 1. Add all standalone sims from SimContext
    sims.forEach(sim => {
      list.push({
        simNumber: sim.simNumber,
        customerName: sim.customerName,
        vehicleNo: sim.vehicleNumber,
        provider: sim.provider,
        status: sim.status
      });
    });

    // 2. Add sims from vehicles that aren't already in SimContext
    const explicitSimNumbers = new Set(sims.map(s => s.simNumber));
    
    customers.forEach(customer => {
      if (customer.vehicles && Array.isArray(customer.vehicles)) {
        customer.vehicles.forEach(vehicle => {
          if (vehicle.simNumber && !explicitSimNumbers.has(vehicle.simNumber)) {
            list.push({
              simNumber: vehicle.simNumber,
              customerName: customer.name,
              vehicleNo: vehicle.vehicleNo,
              provider: 'N/A',
              status: vehicle.status || 'Active'
            });
          }
        });
      }
    });
    return list;
  }, [customers, sims]);`
);

// Filter logic update
fileContent = fileContent.replace(
  `v.simNumber.toLowerCase().includes(searchStr) ||
        v.customerName.toLowerCase().includes(searchStr) ||
        v.vehicleNo.toLowerCase().includes(searchStr)`,
  `v.simNumber?.toLowerCase().includes(searchStr) ||
        v.customerName?.toLowerCase().includes(searchStr) ||
        v.vehicleNo?.toLowerCase().includes(searchStr) ||
        v.provider?.toLowerCase().includes(searchStr)`
);

// Header section Add button
fileContent = fileContent.replace(
  `<div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">SIM Numbers</h1>
            <p className="text-sm text-gray-500">Global overview of all assigned SIM numbers</p>
          </div>
          <div className="relative w-full md:w-64">`,
  `<div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">SIM Numbers</h1>
            <p className="text-sm text-gray-500">Global overview of all assigned SIM numbers</p>
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
            + Add SIM Number
          </button>
          </div>
        </div>`
);

// Table column replace
fileContent = fileContent.replace(
  `<th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Network</th>`,
  `<th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">SIM Provider</th>`
);

fileContent = fileContent.replace(
  `<td className="px-6 py-4 text-gray-600">{item.network}</td>`,
  `<td className="px-6 py-4 text-gray-600">{item.provider}</td>`
);

// Modal injection
fileContent = fileContent.replace(
  `</main>
    </div>`,
  `</main>
      
      <AddSIMModal 
        isOpen={isAddModalOpen} 
        onClose={(success) => {
          setIsAddModalOpen(false);
          if (success === true) {
            showModal({
              type: 'success',
              title: 'Success',
              message: 'SIM Number added successfully',
            });
          }
        }} 
      />
    </div>`
);

fs.writeFileSync('src/pages/devices/SIMNumbers.jsx', fileContent);
console.log('Successfully updated SIMNumbers.jsx');
