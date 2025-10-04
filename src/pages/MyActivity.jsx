// src/pages/MyActivity.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const MyActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ action: '', date_from: '', date_to: '' });

  // Mock actions for filtering
  const actions = [
    'LOGIN', 'REGISTER_PRODUCT', 'UPDATE_PRODUCT', 'SCAN_QR'
  ];

  useEffect(() => {
    fetchMyActivities();
  }, []);

  const fetchMyActivities = async () => {
    try {
      // Fetch activities specific to current user (filter by user_id automatically in backend if needed)
      const response = await api.get('/analytics/activity-logs', {
        params: {
          limit: 100, // Show more activities for personal view
          user: localStorage.getItem('username') // Filter by current user
        }
      });

      if (response.data.success) {
        const activities = response.data.data.map(activity => ({
          ...activity,
          // Convert UTC timestamps to UTC+7 for display
          timestamp: new Date(new Date(activity.timestamp).getTime() + (7 * 60 * 60 * 1000)).toISOString()
        }));
        setActivities(activities);
      } else {
        console.error('API returned error:', response.data.message);
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesAction = !filter.action || activity.action === filter.action;
    
    // Date filtering
    const activityDate = new Date(activity.timestamp);
    const fromDate = filter.date_from ? new Date(filter.date_from) : null;
    const toDate = filter.date_to ? new Date(filter.date_to) : null;
    
    const matchesFromDate = !fromDate || activityDate >= fromDate;
    const matchesToDate = !toDate || activityDate <= toDate;
    
    return matchesAction && matchesFromDate && matchesToDate;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Aktivitas Saya</h1>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="actionFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Aktivitas
            </label>
            <select
              id="actionFilter"
              value={filter.action}
              onChange={(e) => setFilter({...filter, action: e.target.value})}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md max-h-60 overflow-y-auto"
            >
              <option value="">Semua Aktivitas</option>
              {actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Awal
            </label>
            <input
              type="date"
              id="dateFrom"
              value={filter.date_from}
              onChange={(e) => setFilter({...filter, date_from: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Akhir
            </label>
            <input
              type="date"
              id="dateTo"
              value={filter.date_to}
              onChange={(e) => setFilter({...filter, date_to: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis Aktivitas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          activity.action === 'LOGIN' ? 'bg-blue-100 text-blue-800' :
                          activity.action === 'REGISTER_PRODUCT' ? 'bg-green-100 text-green-800' :
                          activity.action === 'UPDATE_PRODUCT' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {activity.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {activity.details}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada aktivitas ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyActivity;
