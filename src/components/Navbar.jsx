// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const navItems = user?.role === 'admin'
    ? [
        // Core Operations
        { name: 'Dashboard', path: '/', icon: '🏠', group: 'main' },
        { name: 'Single Scan', path: '/single-scan', icon: '📱', group: 'main' },
        { name: 'Quick Scan', path: '/quick-scan', icon: '🔍', group: 'main' },
        { name: 'Detail Stok', path: '/detail-stok', icon: '📊', group: 'inventory' },

        // Admin Functions
        { name: 'Manajemen User', path: '/user-management', icon: '👥', group: 'management' },
        { name: 'Generasi QR', path: '/qr-generation', icon: '🔗', group: 'admin' },
        { name: 'Template Produk', path: '/template-management', icon: '📋', group: 'admin' },

        // Management Tools
        { name: 'Log Aktivitas', path: '/activity-log', icon: '📝', group: 'management' },

        // Bulk Operations
        { name: 'Operasi Massal', path: '/bulk-operations', icon: '📦', group: 'bulk' },

        // Settings & Profile
        { name: 'Pengaturan', path: '/settings', icon: '⚙️', group: 'system' },
        { name: 'Profil', path: '/profile', icon: '👤', group: 'system' },
      ]
    : [
        { name: 'Dashboard', path: '/', icon: '🏠' },
        { name: 'Single Scan', path: '/single-scan', icon: '📱' },
        { name: 'Quick Scan', path: '/quick-scan', icon: '🔍' },
        { name: 'Detail Stok', path: '/detail-stok', icon: '📊' },
        { name: 'Aktivitas Saya', path: '/my-activity', icon: '📝' },
        { name: 'Profil', path: '/profile', icon: '👤' },
      ];

  const handleLogout = async () => {
    await logout();
    setIsSidebarOpen(false);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow border-b">
        <div className="flex items-center justify-between px-4 h-12">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-label="Open sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="text-lg font-bold text-blue-600">Stok Bago</div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
          <span className="text-lg font-bold text-white">Stok Bago</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-white hover:bg-blue-700 p-2 rounded transition-colors"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-base mr-3">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout button */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            <span className="text-base mr-3">🚪</span>
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
