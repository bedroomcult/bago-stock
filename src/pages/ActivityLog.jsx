// src/pages/ActivityLog.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ user: '', action: '', date_from: '', date_to: '' });

  // Mock actions for filtering
  const actions = [
    'LOGIN', 'REGISTER_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 
    'GENERATE_QR_CODES', 'SCAN_QR', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER'
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();

      if (filter.user) params.append('user', filter.user);
      if (filter.action) params.append('action', filter.action);
      if (filter.date_from) params.append('date_from', filter.date_from);
      if (filter.date_to) params.append('date_to', filter.date_to);

      const response = await api.get(`/analytics/activity-logs?${params.toString()}`);

      if (response.data.success) {
        setLogs(response.data.data || []);
      } else {
        console.error('API returned error:', response.data.message);
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      // Fallback to empty array if API fails
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesUser = !filter.user || log.user.toLowerCase().includes(filter.user.toLowerCase());
    const matchesAction = !filter.action || log.action === filter.action;
    
    // Date filtering
    const logDate = new Date(log.timestamp);
    const fromDate = filter.date_from ? new Date(filter.date_from) : null;
    const toDate = filter.date_to ? new Date(filter.date_to) : null;
    
    const matchesFromDate = !fromDate || logDate >= fromDate;
    const matchesToDate = !toDate || logDate <= toDate;
    
    return matchesUser && matchesAction && matchesFromDate && matchesToDate;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Log Aktivitas</h1>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Pengguna
            </label>
            <input
              type="text"
              id="userFilter"
              value={filter.user}
              onChange={(e) => setFilter({...filter, user: e.target.value})}
              placeholder="Cari pengguna..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="actionFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Aksi
            </label>
            <select
              id="actionFilter"
              value={filter.action}
              onChange={(e) => setFilter({...filter, action: e.target.value})}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Semua Aksi</option>
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

      {/* Logs Table */}
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
                    Pengguna
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
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
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.details}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada log aktivitas ditemukan
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

export default ActivityLog;
