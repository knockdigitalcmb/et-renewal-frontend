const fs = require('fs');

let content = fs.readFileSync('src/pages/renewal/CustomerRenewal.jsx', 'utf-8');

// Update state declarations
content = content.replace(
  `  const [vehicle, setVehicle] = useState(null);\n  const [notesLength, setNotesLength] = useState(0);`,
  `  const [vehicle, setVehicle] = useState(null);\n  const [customerVehicles, setCustomerVehicles] = useState([]);\n  const [notesLength, setNotesLength] = useState(0);`
);

// Update data loading effect
content = content.replace(
  `  useEffect(() => {
    let data = getVehicle(vehicleId);
    if (!data) {
      const cust = getCustomer(vehicleId);
      if (cust && cust.vehicles && cust.vehicles.length > 0) {
        data = { ...cust.vehicles[0], customerId: cust.id };
      }
    }

    if (data) {
      setVehicle(data);
    } else {
      navigate('/customers');
    }
  }, [vehicleId, getVehicle, getCustomer, navigate]);`,
  `  useEffect(() => {
    let initialVehicle = getVehicle(vehicleId);
    let cust = null;
    
    if (initialVehicle) {
      cust = getCustomer(initialVehicle.customerId);
    } else {
      // Fallback if vehicleId was actually a customerId
      cust = getCustomer(vehicleId);
      if (cust && cust.vehicles && cust.vehicles.length > 0) {
        initialVehicle = { ...cust.vehicles[0], customerId: cust.id };
      }
    }

    if (cust) {
      const vehicles = cust.vehicles ? cust.vehicles.map(v => ({ ...v, customerId: cust.id })) : [];
      setCustomerVehicles(vehicles);
      
      if (vehicles.length > 0) {
        // Find the vehicle that matches the URL, or default to the first one
        const matched = vehicles.find(v => v.id === vehicleId) || vehicles[0];
        setVehicle(matched);
      } else {
        setVehicle(null);
      }
    } else {
      navigate('/customers');
    }
  }, [vehicleId, getVehicle, getCustomer, navigate]);`
);

// Update Header Section (Lines 151-161 approx)
content = content.replace(
  `            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">Vehicle No</p>
              <p className="text-blue-900 dark:text-blue-300 font-bold">{vehicle.vehicleNo}</p>
            </div>`,
  `            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">Vehicle No \u25bc</p>
              <select 
                value={vehicle.id}
                onChange={(e) => {
                  const selected = customerVehicles.find(v => v.id === e.target.value);
                  if (selected) setVehicle(selected);
                }}
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300 font-bold border-none focus:ring-0 p-0 text-base cursor-pointer outline-none"
              >
                {customerVehicles.map(v => (
                  <option key={v.id} value={v.id} className="text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">
                    {v.vehicleNo}
                  </option>
                ))}
              </select>
            </div>`
);

// Disable form if no vehicles
content = content.replace(
  `          <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">`,
  `          {!vehicle && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded text-center font-medium border border-red-100 dark:border-red-800/30">
              No vehicles available for renewal.
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <fieldset disabled={!vehicle}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">`
);

// Close fieldset
content = content.replace(
  `              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};`,
  `              </div>
            </form>
            </fieldset>
          </div>
        </div>
      </main>
    </div>
  );
};`
);

// If vehicle is null before rendering the block, handle gracefully
content = content.replace(
  `  if (!vehicle) return null;
  const cust = getCustomer(vehicle.customerId);
  const displayCustomerName = cust ? cust.name : vehicle.customerId;`,
  `  // Let the UI render the empty state if no vehicle
  const activeVehicleId = vehicle ? vehicle.customerId : vehicleId;
  const cust = getCustomer(activeVehicleId);
  const displayCustomerName = cust ? cust.name : (vehicle ? vehicle.customerId : 'Unknown Customer');`
);

// In case vehicle is null, display empty state in header
content = content.replace(
  `            <div className="text-right">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">Current Expiry Date</p>
              <span className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                {formatDate(vehicle.expiryDate)}
              </span>
            </div>`,
  `            <div className="text-right">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">Current Expiry Date</p>
              <span className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                {vehicle ? formatDate(vehicle.expiryDate) : 'N/A'}
              </span>
            </div>`
);

// Also gracefully handle vehicle.vehicleNo in header
content = content.replace(
  `                value={vehicle.id}`,
  `                value={vehicle?.id || ''}`
);

fs.writeFileSync('src/pages/renewal/CustomerRenewal.jsx', content);
console.log('CustomerRenewal updated successfully.');
