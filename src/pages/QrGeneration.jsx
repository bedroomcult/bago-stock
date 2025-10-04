 // src/pages/QrGeneration.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Toast from '../components/ui/Toast';

const QrGeneration = () => {
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState('png');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/qr/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (count < 1 || count > 1000) {
      setError('Jumlah harus antara 1 dan 1000');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use fetch directly to handle file download
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // If using JWT authentication
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          count: parseInt(count),
          format
        })
      });

      if (!response.ok) {
        // Try to parse as JSON for error messages
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Create blob from response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = format === 'png'
        ? `QR_Codes.zip`
        : `QR_Codes.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create download link and trigger click
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);

      // Show success toast
      setToastMessage(`${count} kode QR berhasil dibuat dan di-download dalam format ${format.toUpperCase()}`);
      setToastType('success');
      setShowToast(true);

    } catch (err) {
      console.error('QR generation error:', err);
      setError(err.message || 'Terjadi kesalahan saat membuat kode QR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Generasi QR Code</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Parameter Generasi</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Kode QR
                </label>
                <input
                  type="number"
                  id="count"
                  min="1"
                  max="1000"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Maksimal 1000 kode QR per generasi</p>
              </div>

              <div>
                <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                  Format Output
                </label>
                <select
                  id="format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md max-h-60 overflow-y-auto"
                >
                  <option value="png">PNG</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Membuat...' : 'Buat Kode QR'}
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Petunjuk Penggunaan</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. Tentukan jumlah kode QR yang ingin dibuat (1-1000)</p>
              <p>2. Pilih format output:</p>
              <ul className="ml-4 mt-1 mb-2">
                <li>• <strong>PNG:</strong> Download ZIP file dengan semua QR code gambar</li>
                <li>• <strong>PDF:</strong> Download file PDF dengan QR code di halaman terpisah</li>
              </ul>
              <p>3. Klik "Buat Kode QR" - file akan otomatis di-download</p>
              <p className="pt-2 text-xs text-gray-500">
                <strong>Catatan:</strong> Setiap kode QR berisi ID unik yang akan digunakan
                untuk mengidentifikasi produk saat pendaftaran.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Statistics */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Statistik Kode QR</h2>

        {statsLoading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-900">{stats.total_generated.toLocaleString()}</h3>
                  <p className="text-sm text-blue-700">Dibuat</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-green-900">{stats.total_used.toLocaleString()}</h3>
                  <p className="text-sm text-green-700">Digunakan</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-yellow-900">{stats.total_unused.toLocaleString()}</h3>
                  <p className="text-sm text-yellow-700">Tersedia</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xs font-semibold text-gray-900">{stats.last_generated || 'Belum ada'}</h3>
                  <p className="text-sm text-gray-700">Terakhir Dibuat</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Tidak dapat memuat statistik</p>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-600">
          <p><strong>Keterangan:</strong></p>
          <ul className="mt-1 ml-4 space-y-1">
            <li>• <strong>Dibuat:</strong> Total kode QR yang telah dihasilkan sistem</li>
            <li>• <strong>Digunakan:</strong> Kode QR yang telah didaftarkan sebagai produk</li>
            <li>• <strong>Tersedia:</strong> Kode QR yang belum digunakan untuk pendaftaran produk</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <Toast
          type={toastType}
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default QrGeneration;
