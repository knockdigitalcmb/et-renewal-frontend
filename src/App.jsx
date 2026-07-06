import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/auth/Login';
import Logout from './pages/auth/Logout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppRoutes from './routes/AppRoutes';

import Dashboard from './pages/dashboard/Dashboard';
import CustomerList from './pages/customer/CustomerList';
import AddCustomer from './pages/customer/AddCustomer';
import ViewCustomer from './pages/customer/ViewCustomer';
import EditCustomer from './pages/customer/EditCustomer';
import AddVehicle from './pages/customer/AddVehicle';
import EditVehicle from './pages/customer/EditVehicle';
import CustomerRenewal from './pages/renewal/CustomerRenewal';
import ImportCustomers from './pages/customer/ImportCustomers';
import RenewalHistory from './pages/renewal/RenewalHistory';
import ResourceList from './pages/resource/ResourceList';
import AddResource from './pages/resource/AddResource';
import ViewResource from './pages/resource/ViewResource';
import EditResource from './pages/resource/EditResource';
import { ResourceProvider } from './context/ResourceContext';
import { CustomerProvider } from './context/CustomerContext';
import { LayoutProvider } from './context/LayoutContext';
import { VehicleTypeProvider } from './context/VehicleTypeContext';
import { ModalProvider } from './context/ModalContext';
import { SettingsProvider } from './context/SettingsContext';
import { ProfileProvider } from './context/ProfileContext';
import { DeviceModelProvider } from './context/DeviceModelContext';
import { SimProvider } from './context/SimContext';
import { ImeiProvider } from './context/ImeiContext';
import { NotificationProvider } from './context/NotificationContext';

function AppLayout() {
  return (
    <div className="min-h-screen bg-white font-sans flex">
      <Sidebar />
      <div className="flex-1 md:ml-[250px] w-full min-w-0">
        <AppRoutes />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/*" element={
          <SettingsProvider>
            <ProfileProvider>
              <ModalProvider>
                <LayoutProvider>
                  <ResourceProvider>
                    <CustomerProvider>
                      <VehicleTypeProvider>
                        <DeviceModelProvider>
                          <ImeiProvider>
                            <SimProvider>
                              <NotificationProvider>
                                  <ProtectedRoute>
                                    <AppLayout />
                                  </ProtectedRoute>
                              <NotificationProvider>
                            </SimProvider>
                          </ImeiProvider>
                        </DeviceModelProvider>
                      </VehicleTypeProvider>
                    </CustomerProvider>
                  </ResourceProvider>
                </LayoutProvider>
              </ModalProvider>
            </ProfileProvider>
          </SettingsProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;
