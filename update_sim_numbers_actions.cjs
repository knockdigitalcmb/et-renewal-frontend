const fs = require('fs');

let fileContent = fs.readFileSync('src/pages/devices/SIMNumbers.jsx', 'utf-8');

// Imports
fileContent = fileContent.replace(
  `import { MdSearch } from 'react-icons/md';`,
  `import { MdSearch, MdEdit, MdVisibility, MdDelete } from 'react-icons/md';\nimport { useNavigate } from 'react-router-dom';\nimport EditSIMModal from '../../components/devices/EditSIMModal';`
);

// Add Navigate, updateVehicle, deleteSim, handlers
fileContent = fileContent.replace(
  `  const { customers } = useCustomer();
  const { sims } = useSim();`,
  `  const { customers, updateVehicle } = useCustomer();
  const { sims, deleteSim } = useSim();
  const navigate = useNavigate();`
);

fileContent = fileContent.replace(
  `  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');`,
  `  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [simToEdit, setSimToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');`
);

fileContent = fileContent.replace(
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
      });`,
  `const allSims = useMemo(() => {
    const list = [];
    // 1. Add all standalone sims from SimContext
    sims.forEach(sim => {
      list.push({
        id: sim.id,
        isLegacy: false,
        customerId: sim.customerId,
        simNumber: sim.simNumber,
        customerName: sim.customerName,
        vehicleNo: sim.vehicleNumber,
        provider: sim.provider,
        status: sim.status
      });`
);

fileContent = fileContent.replace(
  `              simNumber: vehicle.simNumber,
              customerName: customer.name,
              vehicleNo: vehicle.vehicleNo,
              provider: 'N/A',
              status: vehicle.status || 'Active'
            });`,
  `              id: vehicle.id,
              isLegacy: true,
              customerId: customer.id,
              simNumber: vehicle.simNumber,
              customerName: customer.name,
              vehicleNo: vehicle.vehicleNo,
              provider: 'N/A',
              status: vehicle.status || 'Active'
            });`
);

// Add action handlers inside component
fileContent = fileContent.replace(
  `  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">`,
  `  const handleEdit = (sim) => {
    setSimToEdit(sim);
    setIsEditModalOpen(true);
  };

  const handleDelete = (sim) => {
    showModal({
      type: 'confirm',
      title: 'Delete SIM Number',
      message: 'Are you sure you want to delete this SIM?',
      buttons: [
        { text: 'Cancel', style: 'secondary' },
        { 
          text: 'Delete', 
          style: 'danger', 
          onClick: async () => {
            if (sim.isLegacy) {
              await updateVehicle(sim.id, { simNumber: '' });
            } else {
              deleteSim(sim.id);
            }
          }
        }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">`
);

// Table headers
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
                          onClick={() => navigate(\`/customers/view/\${item.customerId}\`)}
                          className="text-[#3498db] hover:text-[#2980b9] p-1.5 rounded hover:bg-blue-50 transition-colors mr-2"
                          title="View Customer"
                        >
                          <MdVisibility className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(item)}
                          className="text-[#f39c12] hover:text-[#e67e22] p-1.5 rounded hover:bg-orange-50 transition-colors mr-2"
                          title="Edit SIM"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item)}
                          className="text-[#e74c3c] hover:text-[#c0392b] p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete SIM"
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
  `      />
    </div>`,
  `      />
      <EditSIMModal 
        isOpen={isEditModalOpen} 
        editData={simToEdit}
        onClose={(success) => {
          setIsEditModalOpen(false);
          setSimToEdit(null);
          if (success === true) {
            showModal({
              type: 'success',
              title: 'Success',
              message: 'SIM Number updated successfully',
            });
          }
        }} 
      />
    </div>`
);

fs.writeFileSync('src/pages/devices/SIMNumbers.jsx', fileContent);
console.log('Successfully updated SIMNumbers.jsx with actions');
