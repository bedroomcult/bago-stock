// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  // Helper function to format timestamp - adjust for UTC+7 timezone
  const formatTimestamp = (timestamp) => {
    try {
      const serverTime = new Date(timestamp);
      // Assuming server/store times are in UTC, add 7 hours for UTC+7 (Indonesia)
      const localTime = new Date(serverTime.getTime() + (7 * 60 * 60 * 1000));
      const now = new Date();

      const diffMs = now - localTime;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} menit lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays < 7) return `${diffDays} hari lalu`;

      // Otherwise return formatted date in Indonesian format
      return localTime.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timestamp; // Fallback to original timestamp
    }
  };

  const [stats, setStats] = useState({
    totalProducts: 0,
    inStore: 0,
    lowStock: 0,
    criticalStock: 0,
    sold: 0,
    totalUsers: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // Fetch products detail from API
        const response = await api.get('/products/detail');
        if (response.data.success) {
          // Filter out TERJUAL products from all calculations since they're sold and not in inventory
          const activeProducts = response.data.data.filter(product => product.status !== 'TERJUAL');

          // Calculate statistics from active (non-sold) products only
          let totalProducts = 0;
          let inStore = 0;
          let lowStock = 0;
          let criticalStock = 0;
          let sold = 0;

          // Count sold products (TERJUAL status) for reference
          const soldProducts = response.data.data.filter(product => product.status === 'TERJUAL');
          soldProducts.forEach(product => {
            sold += product.count || 0;
          });

          // Calculate active inventory stats
          activeProducts.forEach(product => {
            const count = product.count || 0;
            const tokoCount = product.items?.filter(item => item.status === 'TOKO').length || 0;

            // Total active inventory count (all items not TERJUAL)
            totalProducts += count;

            // Items currently in store (TOKO status)
            inStore += tokoCount;

            // Low stock products (count <= 5)
            if (count <= 5) {
              lowStock += 1;
            }

            // Critical stock products (count <= 3)
            if (count <= 3) {
              criticalStock += 1;
            }
          });

          setStats({
            totalProducts,
            inStore,
            lowStock,
            criticalStock,
            sold,
            totalUsers: 4 // Keep as mock data for now
          });
        } else {
          console.error('API returned error:', response.data.message);
          // Fallback to mock data if API fails
          setStats({
            totalProducts: 0,
            inStore: 0,
            lowStock: 0,
            criticalStock: 0,
            sold: 0,
            totalUsers: 4
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to mock data if API fails
        setStats({
          totalProducts: 0,
          inStore: 0,
          lowStock: 0,
          criticalStock: 0,
          sold: 0,
          totalUsers: 4
        });
      }
    };

    // Fetch recent activity
    const fetchActivity = async () => {
      try {
        const response = await api.get('/analytics/dashboard/activities?limit=5');
        if (response.data.success) {
          // Transform timestamp to readable format
          const activities = response.data.data.map(activity => ({
            ...activity,
            timestamp: formatTimestamp(activity.timestamp)
          }));
          setRecentActivity(activities);
        } else {
          console.error('API returned error:', response.data.message);
          // Fallback to empty array if API fails
          setRecentActivity([]);
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
        // Fallback to empty array if API fails
        setRecentActivity([]);
      }
    };

    fetchStats();
    fetchActivity();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Selamat datang, {localStorage.getItem('username') || 'Pengguna'}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Link
          to="/quick-scan"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-sm hover:from-blue-600 hover:to-blue-700 hover:scale-105 transform transition-all duration-200"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium">Quick Scan</h3>
              <p className="text-sm">Pemindaian cepat produk</p>
            </div>
          </div>
        </Link>

        <Link
          to="/single-scan"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-sm hover:from-green-600 hover:to-green-700 hover:scale-105 transform transition-all duration-200"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium">Single Scan</h3>
              <p className="text-sm">Pemindaian satu per satu</p>
            </div>
          </div>
        </Link>

        <Link
          to="/detail-stok"
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-sm hover:from-yellow-600 hover:to-yellow-700 hover:scale-105 transform transition-all duration-200"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium">Detail Stok</h3>
              <p className="text-sm">Lihat detail stok</p>
            </div>
          </div>
        </Link>

        {user?.role === 'admin' && (
          <Link
            to="/qr-generation"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-sm hover:from-purple-600 hover:to-purple-700 hover:scale-105 transform transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Generasi QR</h3>
                <p className="text-sm">Buat kode QR</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Produk</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Di Toko</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inStore}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Stok Kritis</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.criticalStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aktivitas Terbaru */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Aktivitas Terbaru</h2>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 py-1.5 px-2 hover:bg-gray-50 rounded-md transition-colors">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 text-xs font-medium">
                    {activity.user.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                <p className="text-xs text-gray-500 truncate">{activity.details}</p>
              </div>
              <div className="flex-shrink-0">
                <p className="text-xs text-gray-400">{activity.timestamp}</p>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="text-center py-4 text-gray-400">
              <p className="text-sm">Belum ada aktivitas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
