import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import EmployeeRegistration from './pages/EmployeeRegistration';
import EmployeeList from './pages/EmployeeList';
import EmployeeProfile from './pages/EmployeeProfile';
import TransferList from './pages/TransferList';
import TransferForm from './pages/TransferForm';
import RetirementExit from './pages/RetirementExit';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import DocumentVault from './pages/DocumentVault';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function AppContent() {
  const { canManageEmployees, isAdmin } = useAuth();
  
  return (
      <BrowserRouter>
          <Routes>
            <Route path="/portal-admin" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="employees" element={<EmployeeList />} />
              <Route path="documents" element={
                <ProtectedRoute canAccess={canManageEmployees}>
                  <DocumentVault />
                </ProtectedRoute>
              } />
              <Route path="employees/new" element={
                <ProtectedRoute canAccess={canManageEmployees}>
                  <EmployeeRegistration />
                </ProtectedRoute>
              } />
              <Route path="employees/profile" element={<EmployeeProfile />} />
              <Route path="transfers" element={<TransferList />} />
              <Route path="transfers/new" element={
                <ProtectedRoute canAccess={canManageEmployees}>
                  <TransferForm />
                </ProtectedRoute>
              } />
              <Route path="exit" element={<RetirementExit />} />
              <Route path="reports" element={
                <ProtectedRoute canAccess={isAdmin}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="admin" element={
                <ProtectedRoute canAccess={isAdmin}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
      </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
