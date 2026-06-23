import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/auth/Login';
import AppRoutes from './routes/AppRoutes';

import { ResourceProvider } from './context/ResourceContext';
import { CustomerProvider } from './context/CustomerContext';
import { LayoutProvider } from './context/LayoutContext';
import { VehicleTypeProvider } from './context/VehicleTypeContext';
import VehicleTypeMaster from './pages/VehicleTypeMaster';

function AppLayout() {
  return (
    <div className="min-h-screen bg-white font-sans flex">
      <Sidebar />
      <div className="flex-1 md:ml-[250px] w-full min-w-0">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/add" element={<AddCustomer />} />
          <Route path="/customers/view/:id" element={<ViewCustomer />} />
          <Route path="/customers/edit/:id" element={<EditCustomer />} />
          <Route path="/customers/vehicle/add/:customerId" element={<AddVehicle />} />
          <Route path="/customers/vehicle/edit/:vehicleId" element={<EditVehicle />} />
          <Route path="/customers/renewal/:id" element={<CustomerRenewal />} />
          <Route path="/customers/import" element={<ImportCustomers />} />
          <Route path="/renewals" element={<RenewalHistory />} />
          <Route path="/resources/list" element={<ResourceList />} />
          <Route path="/resources/add" element={<AddResource />} />
          <Route path="/resources/view/:id" element={<ViewResource />} />
          <Route path="/resources/edit/:id" element={<EditResource />} />
          <Route path="/master/vehicle-types" element={<VehicleTypeMaster />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <LayoutProvider>
            <VehicleTypeProvider>
              <ResourceProvider>
                <CustomerProvider>
                  <AppLayout />
                </CustomerProvider>
              </ResourceProvider>
            </VehicleTypeProvider>
          </LayoutProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;
