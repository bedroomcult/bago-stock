// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({
    monitoring: true,  // collapsed by default
    system: true       // collapsed by default
  }); // Track collapsed groups
  const sidebarRef = useRef(null);

  // Define navigation groups and items
  const navigationGroups = user?.role === 'admin'
    ? {
        operations: {
          title: '📊 OPERATIONS',
          icon: '📊',
          items: [
            { name: 'Dashboard', path: '/', icon: '🏠' },
            { name: 'Single Scan', path: '/single-scan', icon: '�' },
            { name: 'Quick Scan', path: '/quick-scan', icon: '🔍' },
            { name: 'Detail Stok', path: '/detail-stok', icon: '�' },
          ]
        },
        admin: {
          title: '👑 ADMIN TOOLS',
          icon: '👑',
          items: [
            { name: 'Manajemen User', path: '/user-management', icon: '👥' },
            { name: 'Generasi QR', path: '/qr-generation', icon: '🔗' },
            { name: 'Template Produk', path: '/template-management', icon: '📋' },
            // Removed: 'Bulk Operations', path: '/bulk-operations', icon: '📊'
          ]
        },
        monitoring: {
          title: '📈 MONITORING',
          icon: '📈',
          items: [
            { name: 'Log Aktivitas', path: '/activity-log', icon: '📝' },
            { name: 'Aktivitas Saya', path: '/my-activity', icon: '👁️' },
          ]
        },
        system: {
          title: '⚙️ SYSTEM',
          icon: '⚙️',
          items: [
            { name: 'Pengaturan', path: '/settings', icon: '🔧' },
            { name: 'Profil', path: '/profile', icon: '👤' },
          ]
        }
      }
    : {
        operations: {
          title: '📊 OPERATIONS',
          icon: '📊',
          items: [
            { name: 'Dashboard', path: '/', icon: '🏠' },
            { name: 'Single Scan', path: '/single-scan', icon: '📱' },
            { name: 'Quick Scan', path: '/quick-scan', icon: '🔍' },
            { name: 'Detail Stok', path: '/detail-stok', icon: '�' },
          ]
        },
        monitoring: {
          title: '📈 MONITORING',
          icon: '📈',
          items: [
            { name: 'Aktivitas Saya', path: '/my-activity', icon: '👁️' },
          ]
        },
        system: {
          title: '⚙️ SYSTEM',
          icon: '⚙️',
          items: [
            { name: 'Pengaturan', path: '/settings', icon: '�' },
            { name: 'Profil', path: '/profile', icon: '👤' },
          ]
        }
      };

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

  // Toggle collapse/expand for navigation groups
  const toggleGroup = (groupKey) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

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
        {/* User Header (Mobile) & Desktop Welcome */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          {/* Mobile: User avatar and info */}
          <div className="md:hidden flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.full_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || user?.username}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Staff'}</p>
            </div>
          </div>

          {/* Desktop: Welcome message */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.full_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Welcome, {user?.full_name?.split(' ')[0] || user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Staff'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600 border-b border-blue-700">
          <span className="text-lg font-bold text-white">Stok Bago</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute right-4 text-white hover:bg-blue-700 p-2 rounded transition-colors"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {Object.entries(navigationGroups).map(([groupKey, group]) => (
            <div key={groupKey} className="space-y-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(groupKey)}
                className="flex items-center w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
              >
                <span className="text-sm mr-2">{group.icon}</span>
                <span className="flex-1 text-left">{group.title.replace(/^[^\s]+\s/, '')}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${collapsedGroups[groupKey] ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Group Items */}
              {!collapsedGroups[groupKey] && (
                <div className="ml-2 space-y-0.5">
                  {group.items.map((item) => (
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
                </div>
              )}
            </div>
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
