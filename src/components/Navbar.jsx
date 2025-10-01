// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navItems = user?.role === 'admin'
    ? [
        // Core Operations
        { name: 'Dashboard', path: '/', icon: '🏠', group: 'main' },
        { name: 'Single Scan', path: '/single-scan', icon: '📱', group: 'main' },

        // Inventory Management
        { name: 'Detail Stok', path: '/detail-stok', icon: '📊', group: 'inventory' },

        // Admin Functions
        { name: 'Generasi QR', path: '/qr-generation', icon: '🔗', group: 'admin' },
        { name: 'Template Produk', path: '/template-management', icon: '📋', group: 'admin' },

        // Management Tools
        { name: 'Manajemen User', path: '/user-management', icon: '👥', group: 'management' },
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
        { name: 'Aktivitas Saya', path: '/my-activity', icon: '📝' },
        { name: 'Profil', path: '/profile', icon: '👤' },
      ];

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-lg md:text-xl font-bold text-blue-600">Stok Bago</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.slice(0, 6).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                  title={item.name}
                >
                  {item.icon} <span className="ml-2 hidden lg:inline">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Mobile menu button and user info */}
            <div className="flex items-center">
              {/* User info - hidden on very small screens */}
              <div className="hidden sm:flex items-center mr-4">
                <span className="text-sm text-gray-700">Hi, {user?.fullName || user?.username}</span>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Desktop logout button */}
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex ml-4 items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-25" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Mobile Menu Panel */}
      <div
        ref={menuRef}
        className={`md:hidden fixed top-16 left-0 right-0 bg-white shadow-lg border-t z-50 transform transition-transform duration-200 ease-in-out ${
          isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="px-4 py-2">
          <div className="flex items-center px-3 py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-500">User:</span>
            <span className="ml-2 text-sm text-gray-900">{user?.username} ({user?.role})</span>
          </div>

          <div className="py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-3 text-base font-medium text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <span className="text-lg mr-3">🚪</span>
              Keluar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
