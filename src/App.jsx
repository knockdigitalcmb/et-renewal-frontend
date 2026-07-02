import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/auth/Login';
import Logout from './pages/auth/Logout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppRoutes from './routes/AppRoutes';

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
                              <ProtectedRoute>
                                <AppLayout />
                              </ProtectedRoute>
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
