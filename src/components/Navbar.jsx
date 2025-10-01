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
        { name: 'Quick Scan', path: '/quick-scan', icon: '🔍', group: 'main' },

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
        { name: 'Quick Scan', path: '/quick-scan', icon: '🔍' },
        { name: 'Detail Stok', path: '/detail-stok', icon: '📊' },
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
        <div
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        ref={menuRef}
        className={`md:hidden fixed top-16 left-0 right-0 bg-white shadow-xl border-t border-gray-200 z-50 transform transition-all duration-300 ease-out ${
          isMenuOpen
            ? 'translate-y-0 opacity-100 scale-100'
            : '-translate-y-2 opacity-0 scale-98 pointer-events-none'
        }`}
        style={{ maxHeight: isMenuOpen ? 'calc(100vh - 4rem)' : '0px' }}
      >
        <div className="overflow-y-auto h-full">
          {/* Mobile Header - Always Compact */}
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <span className="text-xs font-medium text-gray-600 truncate">
                  {user?.fullName || user?.username}
                </span>
                <span className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full">
                  {user?.role === 'admin' ? 'Admin' : 'Staff'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-gray-300 rounded-full"></div>
                {/* Close Button */}
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div className="px-2 py-1">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-2 py-2 text-xs font-medium rounded-md transition-all duration-150 active:scale-95 ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
                style={{ minHeight: '36px' }} // Ultra-compact touch target
              >
                <span className="text-base mr-2 w-4 text-center flex items-center justify-center">{item.icon}</span>
                <span className="flex-1 truncate">{item.name}</span>
                {location.pathname === item.path && (
                  <span className="text-blue-600 text-xs">●</span>
                )}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-1 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-xs font-medium text-red-700 hover:bg-red-50 active:bg-red-100 rounded-md transition-all duration-150 active:scale-95 mx-2"
              style={{ minHeight: '36px' }} // Ultra-compact touch target
            >
              <span className="text-base mr-2 w-4 text-center flex items-center justify-center">🚪</span>
              <span className="flex-1 truncate">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
