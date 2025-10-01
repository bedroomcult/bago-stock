// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    low_stock_threshold: 5,
    critical_stock_threshold: 2,
    session_timeout: 43200, // 12 hours in seconds
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // In a real implementation, this would fetch from the API
    // For now, using mock data
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');

    try {
      // In a real implementation, this would update via the API
      // await api.put('/settings', settings);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Pengaturan berhasil disimpan');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan</h1>

      {successMessage && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          {/* Stock Alert Thresholds */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pengaturan Peringatan Stok</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Ambang Batas Stok Rendah
                </label>
                <input
                  type="number"
                  id="low_stock_threshold"
                  value={settings.low_stock_threshold}
                  onChange={(e) => handleInputChange('low_stock_threshold', parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Peringatan muncul ketika stok ≤ nilai ini</p>
              </div>

              <div>
                <label htmlFor="critical_stock_threshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Ambang Batas Stok Kritis
                </label>
                <input
                  type="number"
                  id="critical_stock_threshold"
                  value={settings.critical_stock_threshold}
                  onChange={(e) => handleInputChange('critical_stock_threshold', parseInt(e.target.value))}
                  min="0"
                  max="100"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Peringatan kritis muncul ketika stok ≤ nilai ini</p>
              </div>
            </div>
          </div>

          {/* Session Configuration */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pengaturan Sesi</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="session_timeout" className="block text-sm font-medium text-gray-700 mb-1">
                  Durasi Sesi (detik)
                </label>
                <input
                  type="number"
                  id="session_timeout"
                  value={settings.session_timeout}
                  onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                  min="3600" // 1 hour
                  max="86400" // 24 hours
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Waktu sebelum sesi expired (secara default 12 jam)</p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pengaturan Notifikasi</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="enable_dashboard_notifications"
                  name="enable_dashboard_notifications"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enable_dashboard_notifications" className="ml-2 block text-sm text-gray-900">
                  Tampilkan peringatan di dashboard
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="enable_email_notifications"
                  name="enable_email_notifications"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enable_email_notifications" className="ml-2 block text-sm text-gray-900">
                  Kirim email pemberitahuan
                </label>
              </div>
            </div>
          </div>

          {/* Application Info */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Aplikasi</h2>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Versi Aplikasi</p>
                  <p className="text-sm font-medium">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Database</p>
                  <p className="text-sm font-medium">Supabase PostgreSQL</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;