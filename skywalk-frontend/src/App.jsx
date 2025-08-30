
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import MapPage from './pages/MapPage';
import MainLayout from './components/MainLayout'; // We will use a layout component

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Routes that use the main dashboard layout */}
      <Route path="/" element={<MainLayout><DashboardPage /></MainLayout>} />
      <Route path="/map" element={<MainLayout><MapPage /></MainLayout>} />
      <Route path="/alerts" element={<MainLayout><AlertsPage /></MainLayout>} />
      <Route path="/settings" element={<MainLayout><SettingsPage /></MainLayout>} />
    </Routes>
  );
}

export default App;
