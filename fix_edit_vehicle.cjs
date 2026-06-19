const fs = require('fs');

let content = fs.readFileSync('src/pages/customer/EditVehicle.jsx', 'utf-8');

// 1. Remove duplicated activeResources
content = content.replace(/const activeResources = resources\.filter\(r => r\.status === 'Active'\);\r?\n\s*const activeVehicleTypes = vehicleTypes\.filter\(vt => vt\.status === 'Active'\);\r?\n\s*const activeResources = resources\.filter\(r => r\.status === 'Active'\);\r?\n\s*const activeVehicleTypes = vehicleTypes\.filter\(vt => vt\.status === 'Active'\);/, `const activeResources = resources.filter(r => r.status === 'Active');\n  const activeVehicleTypes = vehicleTypes.filter(vt => vt.status === 'Active');`);

// 2. Insert useWatch AFTER useForm
if (!content.includes('const currentDeviceModel = useWatch({ control, name: \'deviceModel\' });')) {
  content = content.replace(/mode: 'onChange'\r?\n\s*}\);\r?\n/, `mode: 'onChange'\n  });\n\n  const currentDeviceModel = useWatch({ control, name: 'deviceModel' });\n  const displayDeviceModels = React.useMemo(() => {\n    const active = deviceModels.filter(m => m.status === 'Active');\n    if (currentDeviceModel && !active.some(m => m.name === currentDeviceModel)) {\n      return [...active, { id: 'legacy', name: currentDeviceModel }];\n    }\n    return active;\n  }, [deviceModels, currentDeviceModel]);\n`);
}

// 3. Update reset to include safe defaults
const resetRegex = /reset\(\{\r?\n\s*vehicleNo: data\.vehicleNo,[\s\S]*?validity: data\.validity \|\| 12,\r?\n\s*\}\);/;
const safeReset = `reset({
        vehicleNo: data.vehicleNo || '',
        platform: data.platform || '',
        vehicleType: data.vehicleType || '',
        imei: data.imei || '',
        simNumber: data.simNumber || '',
        deviceModel: data.deviceModel || '',
        devicePrice: data.devicePrice || 0,
        simPrice: data.simPrice || 0,
        amountPaid: data.amountPaid || 0,
        paymentMode: data.paymentMode || '',
        installPerson: data.installPerson || '',
        leadClosureBy: data.leadClosureBy || '',
        installDate: data.installDate || '',
        validity: data.validity || 12,
      });`;
content = content.replace(resetRegex, safeReset);

fs.writeFileSync('src/pages/customer/EditVehicle.jsx', content);
console.log('Fixed EditVehicle.jsx');
