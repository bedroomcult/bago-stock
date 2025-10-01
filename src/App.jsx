// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SingleScan from './pages/SingleScan';
// import QuickScan from './pages/QuickScan';
import DetailStok from './pages/DetailStok';
import QrGeneration from './pages/QrGeneration';
import TemplateManagement from './pages/TemplateManagement';
import UserManagement from './pages/UserManagement';
import ActivityLog from './pages/ActivityLog';
import Settings from './pages/Settings';
import BulkOperations from './pages/BulkOperations';
import MyActivity from './pages/MyActivity';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route 
          path="/*" 
          element={
            user ? (
              <>
                <Navbar />
                <div className="pt-16 pb-4 px-2 sm:px-4 lg:px-6 max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/single-scan" element={<SingleScan />} />
                    <Route path="/detail-stok" element={<DetailStok />} />
                    <Route path="/qr-generation" element={user.role === 'admin' ? <QrGeneration /> : <Navigate to="/" />} />
                    <Route path="/template-management" element={user.role === 'admin' ? <TemplateManagement /> : <Navigate to="/" />} />
                    <Route path="/user-management" element={user.role === 'admin' ? <UserManagement /> : <Navigate to="/" />} />
                    <Route path="/activity-log" element={user.role === 'admin' ? <ActivityLog /> : <Navigate to="/" />} />
                    <Route path="/settings" element={user.role === 'admin' ? <Settings /> : <Navigate to="/" />} />
                    <Route path="/bulk-operations" element={user.role === 'admin' ? <BulkOperations /> : <Navigate to="/" />} />
                    <Route path="/my-activity" element={<MyActivity />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </div>
              </>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
