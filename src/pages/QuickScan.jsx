// src/pages/QuickScan.jsx
import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import Webcam from 'react-webcam';
import QrScanner from 'qr-scanner';
import Modal from '../components/ui/Modal';

const QuickScan = () => {
  const [scannedItems, setScannedItems] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [qrToRegister, setQrToRegister] = useState(null);
  const [batchMode, setBatchMode] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [autoScanMode, setAutoScanMode] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const webcamRef = useRef(null);
  const scannerRef = useRef(null);
  const [scannerActive, setScannerActive] = useState(false);

  // Camera duplicate prevention
  const [recentlyScannedCodes, setRecentlyScannedCodes] = useState(new Map()); // Map<qrCode, timestamp>

  // Scan popup states
  const [showScanPopup, setShowScanPopup] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanningPaused, setScanningPaused] = useState(false);

  // Global processing flag to prevent concurrent QR processing
  const isProcessingQrRef = useRef(false);

  // Calculate unique codes that can be processed from batch input
  const calculateProcessableCodesCount = () => {
    if (!batchInput.trim()) return 0;

    const qrCodes = batchInput.split('\n')
      .map(code => code.trim())
      .filter(code => code.length > 0);

    const uniqueQrCodes = [...new Set(qrCodes)];
    const unprocessedQrCodes = uniqueQrCodes.filter(qrCode =>
      !scannedItems.some(item => item.uuid === qrCode)
    );

    return unprocessedQrCodes.length;
  };

  // HTTPS/Camera Detection
  const isHttps = window.location.protocol === 'https:';
  const isLocalhost = window.location.hostname === 'localhost';
  const canUseCamera = isHttps || isLocalhost;

  // Mock status options from the requirements
  const statusOptions = ['TOKO', 'GUDANG KEPATHIAN', 'GUDANG NGUNUT', 'TERJUAL'];

  const handleScan = async (e) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const input = currentInput.trim();
    setCurrentInput('');

    // Check if QR code already exists in scanned items - prevent duplicates
    const existingItem = scannedItems.find(item => item.uuid === input);
    if (existingItem) {
      setError(`⚠️ QR code already scanned: ${input}`);
      setTimeout(() => setError(''), 2000); // Clear error after 2 seconds
      return; // Don't process duplicate
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/scan', { qr_code: input });

      if (response.data.success) {
        if (response.data.exists) {
          // Product exists, add to scanned list
          setScannedItems(prev => [...prev, {
            ...response.data.product,
            isRegistered: true
          }]);
          setSuccessMessage(`Terscan: ${input}`);
          setTimeout(() => setSuccessMessage(''), 3000); // Success message clears automatically
        } else {
          // Product doesn't exist - add as unregistered
          setScannedItems(prev => [...prev, {
            uuid: input,
            isRegistered: false
          }]);
          setQrToRegister(input);
          setError('ℹ️ Unregistered product. Please register it first.');
        }
      } else {
        setError(response.data.message || 'Failed to process QR code');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!selectedStatus) {
      setError('Silakan pilih status untuk diterapkan ke semua produk');
      return;
    }

    const registeredItems = scannedItems.filter(item => item.isRegistered);
    if (registeredItems.length === 0) {
      setError('Tidak ada produk terdaftar untuk diperbarui');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update all registered items to the selected status
      for (const item of registeredItems) {
        await api.put('/products', {
          id: item.id,
          status: selectedStatus
        });
      }

      // Update the local state
      setScannedItems(prev =>
        prev.map(item =>
          item.isRegistered ? { ...item, status: selectedStatus } : item
        )
      );

      // Show success toast instead of browser alert
      setSuccessMessage(`${registeredItems.length} produk berhasil diperbarui ke status ${selectedStatus}`);
      setTimeout(() => setSuccessMessage(''), 5000); // Show longer for bulk operations
      setSelectedStatus('');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat memperbarui produk');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (uuid) => {
    setScannedItems(prev => prev.filter(item => item.uuid !== uuid));
  };

  const clearAll = () => {
    setScannedItems([]);
    setSelectedStatus('');
  };

  const downloadCsv = () => {
    const csvData = [
      ['Kode QR', 'Produk', 'Kategori', 'Status'],
      ...scannedItems.map(item => [
        item.uuid,
        item.isRegistered ? item.product_name : '-',
        item.isRegistered ? item.category : '-',
        item.isRegistered ? item.status : 'Belum Terdaftar',
      ]),
    ];

    const csvString = csvData.map(row => row.join(',')).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'scanned_items.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeRegistration = () => {
    setQrToRegister(null);
  };

  const handleBatchScan = async () => {
    if (!batchInput.trim()) return;

    const qrCodes = batchInput.split('\n')
      .map(code => code.trim())
      .filter(code => code.length > 0);

    if (qrCodes.length === 0) return;

    // Remove duplicates within the batch input itself
    const uniqueQrCodes = [...new Set(qrCodes)];

    // Check for QR codes already in scanned list and remove them from processing
    const unprocessedQrCodes = uniqueQrCodes.filter(qrCode =>
      !scannedItems.some(item => item.uuid === qrCode)
    );

    if (unprocessedQrCodes.length === 0) {
      setError('All QR codes in batch are already scanned or duplicates');
      setTimeout(() => setError(''), 2000);
      // Clear the input anyway since all codes were duplicates
      setBatchInput('');
      return;
    }

    setLoading(true);
    setError('');

    let successCount = 0;
    let errorMessages = [];

    for (const qrCode of unprocessedQrCodes) {
      try {
        const response = await api.post('/scan', { qr_code: qrCode });

        if (response.data.success) {
          if (response.data.exists) {
            // Product exists, add to scanned list if not already there
            const existingItem = scannedItems.find(item => item.uuid === qrCode);
            if (!existingItem) {
              setScannedItems(prev => [...prev, {
                ...response.data.product,
                isRegistered: true
              }]);
              successCount++;
            }
          } else {
            // Product doesn't exist
            const existingItem = scannedItems.find(item => item.uuid === qrCode);
            if (!existingItem) {
              setScannedItems(prev => [...prev, {
                uuid: qrCode,
                isRegistered: false
              }]);
              successCount++;
              // Don't interrupt batch scanning for registration
            }
          }
        } else {
          errorMessages.push(`${qrCode}: ${response.data.message}`);
        }
      } catch (err) {
        errorMessages.push(`${qrCode}: ${err.response?.data?.message || 'Kesalahan sistem'}`);
      }
    }

    setBatchInput('');
    setLoading(false);

    if (errorMessages.length > 0) {
      setError(`Dari ${unprocessedQrCodes.length} kode, ${successCount} berhasil. Kesalahan: ${errorMessages.slice(0, 3).join('; ')}${errorMessages.length > 3 ? '...' : ''}`);
    } else {
      setError(`Berhasil menambahkan ${successCount} kode QR unik`);
    }
  };

  const toggleAutoScanMode = () => {
    setAutoScanMode(!autoScanMode);
    setCurrentInput(''); // Clear input when toggling
  };

  // Add scanningPaused as dependency to re-evaluate scanner when paused/unpaused
  useEffect(() => {}, [scanningPaused]);

  // Camera scanning functionality
  useEffect(() => {
    if (cameraMode && webcamRef.current && canUseCamera) {
      const video = webcamRef.current.video;
      const scanner = new QrScanner(
        video,
        async (result) => {
          // Prevent concurrent QR processing to stop flooding
          if (isProcessingQrRef.current) {
            return; // Ignore this detection while another is being processed
          }

          // Set processing flag
          isProcessingQrRef.current = true;

          try {
            const qrCode = result.data;
            const now = Date.now();
            const lastScanTime = recentlyScannedCodes.get(qrCode);

            // If it's a duplicate in the timeout period, pause scanner for timeout duration
            if (lastScanTime && (now - lastScanTime) < 3000) {
              scannerRef.current?.pause();
              setError(`⚠️ Duplicate QR code detected - scanner paused for 3 seconds`);
              setTimeout(() => {
                setError('');
                scannerRef.current?.start();
              }, 3000);
              return;
            }

            // Check if QR code already exists in the scanned list
            const existingItem = scannedItems.find(item => item.uuid === qrCode);
            if (existingItem) {
              scannerRef.current?.pause();
              setError(`🔄 QR code already scanned - scanner paused for 3 seconds`);
              setTimeout(() => {
                setError('');
                scannerRef.current?.start();
              }, 3000);
              return;
            }

            // NEW QR code - pause scanner completely until popup is closed
            scannerRef.current?.pause();

            const response = await api.post('/scan', { qr_code: qrCode });

            if (response.data.success) {
              if (response.data.exists) {
                // Product exists - show popup with product info and pause scanning
                setScanResult({
                  qrCode,
                  product: response.data.product,
                  isRegistered: true,
                  onClose: () => {
                    setScannedItems(items => [...items, {
                      ...response.data.product,
                      isRegistered: true
                    }]);
                    setSuccessMessage(`✅ Added: ${response.data.product.product_name}`);
                    setTimeout(() => setSuccessMessage(''), 3000);
                    scannerRef.current?.start();
                  }
                });
                setShowScanPopup(true);
                setRecentlyScannedCodes(prev => new Map(prev).set(qrCode, Date.now()));
              } else {
                // Product doesn't exist - show popup for unregistered and pause scanning
                setScanResult({
                  qrCode,
                  product: null,
                  isRegistered: false,
                  onClose: () => {
                    setScannedItems(items => [...items, {
                      uuid: qrCode,
                      isRegistered: false
                    }]);
                    setQrToRegister(qrCode);
                    setError('ℹ️ Unregistered product added. Please register it for full functionality.');
                    scannerRef.current?.start();
                  }
                });
                setShowScanPopup(true);
                setRecentlyScannedCodes(prev => new Map(prev).set(qrCode, Date.now()));
              }
            } else {
              setError(`❌ Failed to scan QR code: ${response.data.message}`);
              scannerRef.current?.start();
            }
          } catch (err) {
            setError(`❌ Error scanning QR code: ${err.response?.data?.message || err.message}`);
            scannerRef.current?.start();
          } finally {
            // Always reset processing flag
            isProcessingQrRef.current = false;
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scannerRef.current = scanner;

      scanner.start().then(() => {
        setScannerActive(true);
        setCameraError('');
      }).catch((err) => {
        setCameraError('Tidak dapat mengakses kamera: ' + err.message);
        setScannerActive(false);
      });

      return () => {
        scanner.stop();
        setScannerActive(false);
      };
    }
  }, [cameraMode, canUseCamera]);

  const processScannedCode = async (qrCode) => {
    // Check if QR code already exists in scanned items - prevent duplicates
    const existingItem = scannedItems.find(item => item.uuid === qrCode);
    if (existingItem) {
      // Vibrate briefly to indicate attempt but no action taken
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
      setError(`⚠️ QR code already scanned: ${qrCode}`);
      setTimeout(() => setError(''), 2000); // Clear error after 2 seconds
      return; // Don't process duplicate
    }

    setLoading(true);
    try {
      const response = await api.post('/scan', { qr_code: qrCode });

      if (response.data.success) {
        if (response.data.exists) {
          // Product exists, add to scanned list
          setScannedItems(prev => [...prev, {
            ...response.data.product,
            isRegistered: true
          }]);
          setSuccessMessage(`Terscan: ${qrCode}`);
          setTimeout(() => setSuccessMessage(''), 3000); // Success message clears automatically
        } else {
          // Product doesn't exist - add as unregistered
          setScannedItems(prev => [...prev, {
            uuid: qrCode,
            isRegistered: false
          }]);
          setQrToRegister(qrCode);
          setError('ℹ️ Unregistered product. Please register it first.');
        }
      } else {
        setError('❌ ' + (response.data.message || 'Failed to process QR code'));
      }
    } catch (err) {
      setError('❌ ' + (err.response?.data?.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Pemindaian Cepat</h1>
            <p className="text-blue-100">Pindai kode QR dengan cepat dan efisien</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{scannedItems.length}</div>
            <div className="text-sm text-blue-100">Item Dipindai</div>
            {scannedItems.length > 0 && (
              <div className="flex gap-2 mt-2 text-xs">
                <span className="bg-green-500 text-white px-2 py-1 rounded-full">
                  ✓ {scannedItems.filter(item => item.isRegistered).length}
                </span>
                <span className="bg-yellow-500 text-white px-2 py-1 rounded-full">
                  ? {scannedItems.filter(item => !item.isRegistered).length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Toast Notification */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-bounce">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Top Section: Camera View (when active) */}
      {cameraMode && (
        <div className="mb-6">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                📷 Live Camera Scan
                {scannerActive && <span className="text-green-600 ml-2 font-normal">● Scanning Active</span>}
              </h2>
              <div className="flex items-center space-x-2">
                {cameraError && <span className="text-sm text-red-600">{cameraError}</span>}
                <button
                  onClick={() => setCameraMode(false)}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Close Camera
                </button>
              </div>
            </div>

            {/* HTTPS/Camera Detection Warning */}
            {!canUseCamera ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  🔒 Camera Requires HTTPS
                </h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Camera access is blocked by browser security on HTTP connections.
                  Production deployments automatically use HTTPS.
                </p>

                <div className="bg-white rounded-lg p-4 border border-yellow-300 mb-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">🛠️ For Development:</h4>
                  <div className="text-left text-sm text-gray-600 space-y-1">
                    <p><strong>Chrome:</strong> Go to <code className="bg-gray-100 px-1 rounded">chrome://flags/#unsafely-treat-insecure-origin-as-secure</code></p>
                    <p><strong>Add:</strong> <code className="bg-gray-100 px-1 rounded">{window.location.protocol}//{window.location.host}</code></p>
                    <p className="text-xs text-gray-500 mt-2">Or use HTTPS dev server with self-signed certificate</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Camera will work automatically in production with HTTPS.
                </p>
              </div>
            ) : (
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '350px' }}>
                {cameraMode && (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: 'environment', // Back camera by default
                      width: { ideal: 1920 },
                      height: { ideal: 1080 }
                    }}
                    className="w-full h-full object-cover"
                    onUserMediaError={(err) => {
                      setCameraError('Camera access denied or unavailable');
                      console.error('Camera error:', err);
                    }}
                  />
                )}

                {/* Scanning overlay */}
                {scannerActive && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-44 h-44 border-4 border-green-500 rounded-lg opacity-75 animate-pulse"></div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-28">
                      <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                        Position QR code in center
                      </div>
                    </div>

            {/* Scanning Status indicator */}
            <div className="absolute top-4 left-4">
              <div className={`text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${scannerActive ? 'bg-green-500' : 'bg-red-500'}`}>
                {scannerActive ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Ready to Scan</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Initializing...</span>
                  </>
                )}
              </div>
            </div>
                  </div>
                )}

                {/* Camera controls */}
                <div className="absolute top-4 right-4 space-y-2">
                  {!scannerActive && (
                    <div className="bg-red-500 text-white p-3 rounded-full animate-pulse">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructions - Show only when camera is available */}
            {canUseCamera && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">📋 How to Scan:</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Point your camera at a QR code</li>
                  <li>• Position the code inside the green scanning area</li>
                  <li>• Device will vibrate when code is detected</li>
                  <li>• Scanned items appear in the list below automatically</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Bar - Large Icon Buttons */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Choose Scan Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setBatchMode(false);
              setCameraMode(false);
            }}
            className={`group p-4 border-2 rounded-lg transition-all hover:shadow-md ${
              !batchMode && !cameraMode
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${!batchMode && !cameraMode ? 'bg-blue-500' : 'bg-gray-100'}`}>
                <svg className={`h-6 w-6 ${!batchMode && !cameraMode ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="text-left">
                <div className={`font-semibold ${!batchMode && !cameraMode ? 'text-blue-900' : 'text-gray-900'}`}>Manual Entry</div>
                <div className={`text-sm ${!batchMode && !cameraMode ? 'text-blue-600' : 'text-gray-500'}`}>Type or paste QR codes</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setBatchMode(true);
              setCameraMode(false);
            }}
            className={`group p-4 border-2 rounded-lg transition-all hover:shadow-md ${
              batchMode && !cameraMode
                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${batchMode && !cameraMode ? 'bg-purple-500' : 'bg-gray-100'}`}>
                <svg className={`h-6 w-6 ${batchMode && !cameraMode ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className={`font-semibold ${batchMode && !cameraMode ? 'text-purple-900' : 'text-gray-900'}`}>Batch Scan</div>
                <div className={`text-sm ${batchMode && !cameraMode ? 'text-purple-600' : 'text-gray-500'}`}>Process multiple codes</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setBatchMode(false);
              setCameraMode(!cameraMode);
            }}
            className={`group p-4 border-2 rounded-lg transition-all hover:shadow-md ${
              cameraMode
                ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${cameraMode ? 'bg-green-500' : 'bg-gray-100'}`}>
                <svg className={`h-6 w-6 ${cameraMode ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className={`font-semibold ${cameraMode ? 'text-green-900' : 'text-gray-900'}`}>Camera Scan</div>
                <div className={`text-sm ${cameraMode ? 'text-green-600' : 'text-gray-500'}`}>Live QR code scanning</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected Scan Mode Details */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">

            {batchMode ? (
              /* Batch Scan Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paste QR Codes
                  </label>
                  <textarea
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    placeholder="Paste QR codes here, one per line..."
                    rows={6}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                  />
                </div>

                <button
                  onClick={handleBatchScan}
                  disabled={loading || !batchInput.trim()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Process Batch (${calculateProcessableCodesCount()} new codes)`}
                </button>
              </div>
            ) : (
              /* Single Scan Mode */
              <form onSubmit={handleScan} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="qrInput" className="block text-sm font-medium text-gray-700">
                      Enter QR Code
                    </label>
                    <button
                      type="button"
                      onClick={toggleAutoScanMode}
                      className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                        autoScanMode
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={autoScanMode ? 'Disable auto-submit' : 'Enable auto-submit (Enter key)'}
                    >
                      {autoScanMode ? 'Auto: ON' : 'Auto: OFF'}
                    </button>
                  </div>
                  <input
                    type="text"
                    id="qrInput"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (autoScanMode && e.key === 'Enter') {
                        e.preventDefault();
                        handleScan(e);
                      }
                    }}
                    placeholder={autoScanMode ? "Type QR code and press Enter" : "Enter or scan QR code"}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    autoFocus
                  />
                  {autoScanMode && (
                    <p className="text-xs text-green-600 mt-1">
                      Press Enter after typing each code
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !currentInput.trim()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Add to List
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Daftar Item Dipindai */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Item Dipindai ({scannedItems.length})</h2>
              {(error || cameraError) && (
                <div className="text-sm text-red-600 max-w-md">{error || cameraError}</div>
              )}
            </div>

            {scannedItems.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada item yang dipindai</h3>
                <p className="text-gray-500">Gunakan metode pemindaian di atas untuk menambahkan kode QR ke daftar Anda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode QR</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scannedItems.map((item, index) => {
                      const qrCode = item.qr_code || item.uuid;
                      return (
                      <tr key={qrCode || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 max-w-xs truncate" title={qrCode}>
                          {qrCode}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.isRegistered ? (
                            <span className="font-medium">{item.product_name}</span>
                          ) : (
                            <span className="text-yellow-700 italic">Tidak Terdaftar</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {item.isRegistered ? item.category : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.isRegistered ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.status === 'TOKO' ? 'bg-green-100 text-green-800' :
                              item.status === 'TERJUAL' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => removeItem(item.uuid)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Hapus dari daftar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.136 21H7.864a2 2 0 01-1.997-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Bulk Actions */}
      <div className="mt-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Bulk Actions</h2>
              <p className="mt-1 text-sm text-gray-500">Update status for all registered products at once</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="bulkStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Update Status
                </label>
                <select
                  id="bulkStatus"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Choose status...</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={handleBulkUpdate}
                  disabled={loading || !selectedStatus || scannedItems.filter(item => item.isRegistered).length === 0}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : `Update ${scannedItems.filter(item => item.isRegistered).length} Items`}
                </button>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={clearAll}
                  disabled={loading || scannedItems.length === 0}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Clear All
                </button>

                <button
                  onClick={downloadCsv}
                  disabled={loading || scannedItems.length === 0}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  title="Download CSV"
                >
                  📥 CSV
                </button>
              </div>
            </div>

            {scannedItems.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  <p><strong>Summary:</strong> {scannedItems.length} total items scanned</p>
                  <p><strong>Registered:</strong> {scannedItems.filter(item => item.isRegistered).length} products found</p>
                  <p><strong>Unregistered:</strong> {scannedItems.filter(item => !item.isRegistered).length} items need registration</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scan Result Popup Modal */}
      <Modal
        isOpen={showScanPopup}
        onClose={() => {
          setShowScanPopup(false);
          setScanningPaused(false); // Resume scanning when modal is closed
          // Execute the onClose action to add the item to list
          if (scanResult?.onClose) {
            scanResult.onClose();
          }
        }}
        title={scanResult?.isRegistered ? "✅ Product Scanned" : "📝 Unregistered Code Scanned"}
        size="md"
        showCloseButton={true}
      >
        <div className="text-center">
          {scanResult?.isRegistered ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900">Product Found!</h4>
                <p className="text-sm text-gray-600 mt-1">Adding to your scan list...</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">QR Code:</span>
                    <span className="text-sm font-mono text-gray-900">{scanResult.qrCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Product:</span>
                    <span className="text-sm font-medium text-gray-900">{scanResult.product.product_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm text-gray-900">{scanResult.product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      scanResult.product.status === 'TOKO' ? 'bg-green-100 text-green-800' :
                      scanResult.product.status === 'TERJUAL' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {scanResult.product.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900">Unregistered QR Code</h4>
                <p className="text-sm text-gray-600 mt-1">Adding to list for registration...</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">QR Code:</span>
                  <span className="text-sm font-mono text-gray-900">{scanResult?.qrCode}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Product Registration Modal */}
      {qrToRegister && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Daftarkan Produk Baru</h3>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode QR
                  </label>
                  <input
                    type="text"
                    value={qrToRegister}
                    disabled
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori Produk
                  </label>
                  <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option>Sofa</option>
                    <option>Kursi</option>
                    <option>Meja</option>
                    <option>Sungkai</option>
                    <option>Nakas</option>
                    <option>Buffet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama produk"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option>TOKO</option>
                    <option>GUDANG KEPATHIAN</option>
                    <option>GUDANG NGUNUT</option>
                    <option>TERJUAL</option>
                  </select>
                </div>
              </form>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeRegistration}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Batal
                </button>
                <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Daftarkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickScan;
