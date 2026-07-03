import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerList from '../pages/customer/CustomerList';
import AddCustomer from '../pages/customer/AddCustomer';
import RenewalHistory from '../pages/renewal/RenewalHistory';
import ResourceList from '../pages/resource/ResourceList';
import AddResource from '../pages/resource/AddResource';
import ViewResource from '../pages/resource/ViewResource';
import EditResource from '../pages/resource/EditResource';
import Dashboard from '../pages/dashboard/Dashboard';
import ViewCustomer from '../pages/customer/ViewCustomer';
import EditCustomer from '../pages/customer/EditCustomer';
import CustomerRenewal from '../pages/renewal/CustomerRenewal';
import EditVehicle from '../pages/customer/EditVehicle';
import AddVehicle from '../pages/customer/AddVehicle';
import ImportCustomers from '../pages/customer/ImportCustomers';
import Profile from '../pages/settings/Profile';
import Settings from '../pages/settings/Settings';
import Notifications from '../pages/notifications/Notifications';
import VehicleTypes from '../pages/devices/VehicleTypes';
import VehicleList from '../pages/devices/VehicleList';
import DeviceModels from '../pages/devices/DeviceModels';
import IMEINumbers from '../pages/devices/IMEINumbers';
import SIMNumbers from '../pages/devices/SIMNumbers';
import ViewSIM from '../pages/devices/ViewSIM';
import ViewImei from '../pages/devices/ViewImei';
import EditImei from '../pages/devices/EditImei';

const AppRoutes = () => {
  return (
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
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/resources/list" element={<ResourceList />} />
      <Route path="/resources/add" element={<AddResource />} />
      <Route path="/resources/view/:id" element={<ViewResource />} />
      <Route path="/resources/edit/:id" element={<EditResource />} />
      
      {/* Device Management Routes */}
      <Route path="/devices/vehicles" element={<VehicleList />} />
      <Route path="/devices/vehicle-types" element={<VehicleTypes />} />
      <Route path="/devices/device-models" element={<DeviceModels />} />
      <Route path="/devices/imei-numbers" element={<IMEINumbers />} />
      <Route path="/devices/imei-numbers/view/:imeiId" element={<ViewImei />} />
      <Route path="/devices/imei-numbers/edit/:imeiId" element={<EditImei />} />
      <Route path="/devices/sim-numbers" element={<SIMNumbers />} />
      <Route path="/devices/sim-numbers/view/:simId" element={<ViewSIM />} />
    </Routes>
  );
};

export default AppRoutes;
