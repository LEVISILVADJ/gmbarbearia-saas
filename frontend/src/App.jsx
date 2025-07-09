import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';

// Páginas públicas
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas protegidas
import Dashboard from './pages/Dashboard';
import SelectTenant from './pages/SelectTenant';
import Subscription from './pages/Subscription';
import AdminDashboard from './pages/admin/AdminDashboard';

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Componente para rotas de admin
const AdminRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!user || !user.is_admin) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rotas protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/select-tenant" element={
          <ProtectedRoute>
            <SelectTenant />
          </ProtectedRoute>
        } />
        <Route path="/subscription" element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        } />
        
        {/* Rotas de admin */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        {/* Rota de fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;