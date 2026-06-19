const fs = require('fs');

let addModalContent = fs.readFileSync('src/components/devices/AddSIMModal.jsx', 'utf-8');

let editModalContent = addModalContent.replace(/AddSIMModal/g, 'EditSIMModal');
editModalContent = editModalContent.replace(/Add SIM Number/g, 'Edit SIM Number');
editModalContent = editModalContent.replace(/Save SIM Number/g, 'Update SIM Number');

// Add editData prop
editModalContent = editModalContent.replace(
  `const EditSIMModal = ({ isOpen, onClose }) => {`,
  `const EditSIMModal = ({ isOpen, onClose, editData }) => {`
);

// Update reset effect to use editData
editModalContent = editModalContent.replace(
  `  useEffect(() => {
    if (!isOpen) {
      reset({ status: 'Active' });
      setSubmitError('');
    }
  }, [isOpen, reset]);`,
  `  useEffect(() => {
    if (!isOpen) {
      reset({ status: 'Active' });
      setSubmitError('');
    } else if (editData) {
      reset({
        simNumber: editData.simNumber,
        provider: editData.provider !== 'N/A' ? editData.provider : '',
        customerId: editData.customerId,
        vehicleNumber: editData.vehicleNo || '',
        status: editData.status || 'Active'
      });
    }
  }, [isOpen, reset, editData]);`
);

// Update onSubmit to call updateSim or addSim, and avoid duplicate checking if SIM number didn't change
editModalContent = editModalContent.replace(
  `      // Global Unique Check
      const simStr = data.simNumber.trim();
      let isDuplicate = false;
      
      // Check legacy vehicles
      for (const cust of customers) {
        if (cust.vehicles) {
          for (const v of cust.vehicles) {
            if (v.simNumber === simStr) {
              isDuplicate = true;
              break;
            }
          }
        }
        if (isDuplicate) break;
      }
      
      if (isDuplicate) {
        setSubmitError('This SIM Number is already assigned.');
        return;
      }

      const cust = customers.find(c => c.id === data.customerId);
      const simData = {
        simNumber: simStr,
        provider: data.provider,
        customerId: data.customerId,
        customerName: cust ? cust.name : 'Unknown',
        vehicleNumber: data.vehicleNumber || 'Unassigned',
        status: data.status
      };
      
      await addSim(simData);`,
  `      // Global Unique Check ONLY if SIM number changed
      const simStr = data.simNumber.trim();
      let isDuplicate = false;
      
      if (!editData || simStr !== editData.simNumber) {
        for (const cust of customers) {
          if (cust.vehicles) {
            for (const v of cust.vehicles) {
              if (v.simNumber === simStr) {
                isDuplicate = true;
                break;
              }
            }
          }
          if (isDuplicate) break;
        }
        
        if (isDuplicate) {
          setSubmitError('This SIM Number is already assigned.');
          return;
        }
      }

      const cust = customers.find(c => c.id === data.customerId);
      const simData = {
        simNumber: simStr,
        provider: data.provider,
        customerId: data.customerId,
        customerName: cust ? cust.name : 'Unknown',
        vehicleNumber: data.vehicleNumber || 'Unassigned',
        status: data.status
      };
      
      const { updateSim } = require('../../context/SimContext').useSim();
      if (editData && !editData.isLegacy) {
        await updateSim(editData.id, simData);
      } else {
        await addSim(simData);
      }`
);

fs.writeFileSync('src/components/devices/EditSIMModal.jsx', editModalContent);
console.log('Created EditSIMModal.jsx');
