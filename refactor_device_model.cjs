const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/pages/customer/AddCustomer.jsx',
  'src/pages/customer/EditCustomer.jsx',
  'src/pages/customer/EditVehicle.jsx'
];

for (const relPath of targetFiles) {
  const file = path.join(__dirname, relPath);
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // 1. Add context import
  if (!content.includes('DeviceModelContext')) {
    content = content.replace(/(import \{ useVehicleType \} from '..\/..\/context\/VehicleTypeContext';)/, `$1\nimport { useDeviceModel } from '../../context/DeviceModelContext';`);
    changed = true;
  }

  // 2. Destructure useDeviceModel inside component
  if (!content.includes('const { deviceModels } = useDeviceModel()')) {
    // find `const { vehicleTypes } = useVehicleType();`
    content = content.replace(/(const \{ vehicleTypes \} = useVehicleType\(\);)/, `$1\n  const { deviceModels } = useDeviceModel();\n  const activeDeviceModels = deviceModels.filter(m => m.status === 'Active');`);
    changed = true;
  }

  // 3. Replace <input ... {...register('deviceModel'...> with <select>
  // In AddCustomer.jsx it uses a custom <InputLabel /> sometimes, but the input itself is standard or NumericInput? No, it was a standard text input, maybe with restrictAlphanumeric.
  // Let's replace the whole input block
  const regex = /<input[^>]*?\{\.\.\.register\('deviceModel'[^>]*?>/g;
  if (regex.test(content)) {
    // It exists! Let's construct the replacement
    const replacement = `<select 
                    {...register('deviceModel', { required: 'Device Model is required' })}
                    className={getInputClass('deviceModel')}
                  >
                    <option value="">Select</option>
                    {activeDeviceModels.map(dm => (
                      <option key={dm.id} value={dm.name}>{dm.name}</option>
                    ))}
                  </select>`;
    content = content.replace(regex, replacement);
    changed = true;
  }
  
  // But wait, what if it's EditCustomer or EditVehicle? We need the existing value to show even if inactive.
  // The simplest way to handle this in a React select without adding complexity is to dynamically inject the current value if it's missing from options.
  // We can do this safely:
  /*
  const currentDeviceModel = useWatch({ control, name: 'deviceModel' });
  const displayDeviceModels = useMemo(() => {
    const active = deviceModels.filter(m => m.status === 'Active');
    if (currentDeviceModel && !active.some(m => m.name === currentDeviceModel)) {
      return [...active, { id: 'legacy', name: currentDeviceModel }];
    }
    return active;
  }, [deviceModels, currentDeviceModel]);
  */
  // Since AddCustomer/EditCustomer are already huge, let's just use `activeDeviceModels` and the user requested:
  // "Existing customers using that model should still display correctly."
  // Wait, if it's just `<select>` and the value from DB isn't in options, it won't show.
  // Let's add that `displayDeviceModels` logic.
  
  if (relPath.includes('Edit')) {
    const memoRegex = /const activeDeviceModels = deviceModels\.filter\(m => m\.status === 'Active'\);/;
    if (memoRegex.test(content)) {
      const advancedLogic = `const currentDeviceModel = useWatch({ control, name: 'deviceModel' });
  const displayDeviceModels = React.useMemo(() => {
    const active = deviceModels.filter(m => m.status === 'Active');
    if (currentDeviceModel && !active.some(m => m.name === currentDeviceModel)) {
      return [...active, { id: 'legacy', name: currentDeviceModel }];
    }
    return active;
  }, [deviceModels, currentDeviceModel]);`;
      content = content.replace(memoRegex, advancedLogic);
      
      // Update the select to map displayDeviceModels
      content = content.replace(/activeDeviceModels\.map/g, 'displayDeviceModels.map');
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${relPath}`);
  }
}
