// src/pages/QuickScan.jsx
import React, { useState } from 'react';
import api from '../utils/api';

const QuickScan = () => {
  const [scannedItems, setScannedItems] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrToRegister, setQrToRegister] = useState(null);
  
  // Mock status options from the requirements
  const statusOptions = ['TOKO', 'GUDANG KEPATHIAN', 'GUDANG NGUNUT', 'TERJUAL'];

  const handleScan = async (e) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const input = currentInput.trim();
    setCurrentInput('');

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/scan', { uuid: input });
      
      if (response.data.success) {
        if (response.data.exists) {
          // Product exists, add to scanned list
          const existingItem = scannedItems.find(item => item.uuid === input);
          if (!existingItem) {
            setScannedItems(prev => [...prev, {
              ...response.data.product,
              isRegistered: true
            }]);
          } else {
            setError('Kode QR ini sudah dipindai sebelumnya');
          }
        } else {
          // Product doesn't exist
          const existingItem = scannedItems.find(item => item.uuid === input);
          if (!existingItem) {
            setScannedItems(prev => [...prev, {
              uuid: input,
              isRegistered: false
            }]);
            setQrToRegister(input);
          } else {
            setError('Kode QR ini sudah dipindai sebelumnya');
          }
        }
      } else {
        setError(response.data.message || 'Gagal memindai kode QR');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat memindai');
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

      alert(`${registeredItems.length} produk berhasil diperbarui ke status ${selectedStatus}`);
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
      ...scannedItems.map((item) => [
        item.uuid,
        item.isRegistered ? item.product_name : '-',
        item.isRegistered ? item.category : '-',
        item.isRegistered ? item.status : 'Belum Terdaftar',
      ]),
    ];

    const csvString = csvData.map((row) => row.join(',')).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'scanned_items.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCsv = () => {
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

    const link = document.createElement('a');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
    link.setAttribute('download', 'scanned_items.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeRegistration = () => {
      ['Kode QR', 'Produk', 'Kategori', 'Status'],
      ...scannedItems.map(item => [
        item.uuid,
        item.isRegistered ? item.product_name : '-',
        item.isRegistered ? item.category : '-',
        item.isRegistered ? item.status : 'Belum Terdaftar',
      ]),
    ];

    const csvString = csvData.map(row => row.join(',')).join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
    link.setAttribute('download', 'scanned_items.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'scanned_items.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const closeRegistration = () => {
    setQrToRegister(null);
  };

  return (
    
      Quick Scan

      
        {/* Scan Input Section */}
        
          
            Pemindaian
            
            
              
                Kode QR
              
              
                Pindai atau masukkan kode QR
              
            

            
              Tambahkan
            
          

          
            Aksi Massal
            
            
              
                Status Baru
              
              
                Pilih status
                {statusOptions.map(status => (
                  {status}
                ))}
              
            

            
              Terapkan ke Produk Terdaftar
            

            
              Bersihkan Semua
            
          
        

        {/* Scanned Items List */}
        
          
            Item Terpindai ({scannedItems.length})
            {error && (
              {error}
            )}
          

          {scannedItems.length === 0 ? (
            
              
              
              Belum ada item terpindai
              
              Pindai kode QR untuk menambahkan item ke daftar
            
          ) : (
            
              
                
                  
                    Kode QR
                  
                  
                    Produk
                  
                  
                    Kategori
                  
                  
                    Status
                  
                  
                    Aksi
                  
                
              
              
                {scannedItems.map((item, index) => (
                  
                    {item.uuid}
                  
                  
                    {item.isRegistered ? item.product_name : '-'}
                  
                  
                    {item.isRegistered ? item.category : '-'}
                  
                  
                    {item.isRegistered ? (
                      
                        {item.status === 'TOKO' ? 'bg-green-100 text-green-800' :
                        item.status === 'TERJUAL' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                        }`}>
                        {item.status}
                      
                    ) : (
                      
                        Belum Terdaftar
                      
                    )}
                  
                  
                    
                      Hapus
                    
                  
                ))}
              
            
          )}
        
      

    

    {qrToRegister && (
      
        
          
            Daftarkan Produk Baru
          
          
            
              
                Kode QR
              
              
                {qrToRegister}
              
            
            
              
                
                  Kategori Produk
                
                
                  Pilih Kategori
                  Sofa
                  Kursi
                  Meja
                  Sungkai
                  Nakas
                  Buffet
                
              
              
                
                  Nama Produk
                
                
                  
                
              
              
                
                  Status
                
                
                  Pilih Status
                  TOKO
                  GUDANG KEPATHIAN
                  GUDANG NGUNUT
                  TERJUAL
                
              
            
          
          
            
              
                Daftarkan
              
              
                Batal
              
            
          
        
      
    )}
  );
};

export default QuickScan;
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quick Scan</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan Input Section */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pemindaian</h2>
            
            <form onSubmit={handleScan} className="space-y-4">
              <div>
                <label htmlFor="qrInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Kode QR
                </label>
                <input
                  type="text"
                  id="qrInput"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Pindai atau masukkan kode QR"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !currentInput.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Tambahkan
              </button>
            </form>

            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">Aksi Massal</h3>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="bulkStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    Status Baru
                  </label>
                  <select
                    id="bulkStatus"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Pilih status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleBulkUpdate}
                  disabled={loading || !selectedStatus || scannedItems.filter(item => item.isRegistered).length === 0}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  Terapkan ke Produk Terdaftar
                </button>

                <button
                  onClick={clearAll}
                  disabled={loading || scannedItems.length === 0}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Bersihkan Semua
                </button>
              {/* Ekspor Daftar
            
            
              Ekspor Daftar
            
                  onClick={downloadCsv}
                  disabled={loading || scannedItems.length === 0}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Ekspor Daftar
                </button>
                  onClick={() => {
                    // TODO: Implement export functionality
                    alert('Export functionality not implemented yet');
                  }}
                  disabled={loading || scannedItems.length === 0}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Ekspor Daftar
                </button>
               */}
              </div>
            </div>
          </div>
        </div>

        {/* Scanned Items List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Item Terpindai ({scannedItems.length})</h2>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
            </div>

            {scannedItems.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada item terpindai</h3>
                <p className="mt-1 text-sm text-gray-500">Pindai kode QR untuk menambahkan item ke daftar</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Kode QR
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Produk
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Kategori
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {scannedItems.map((item, index) => (
                      <tr key={index} className={item.isRegistered ? 'bg-white' : 'bg-yellow-50'}>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-900 font-mono">
                          {item.uuid}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-900">
                          {item.isRegistered ? item.product_name : '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                          {item.isRegistered ? item.category : '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm">
                          {item.isRegistered ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.status === 'TOKO' ? 'bg-green-100 text-green-800' :
                              item.status === 'TERJUAL' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status}
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Belum Terdaftar
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm">
                          <button
                            onClick={() => removeItem(item.uuid)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickScan;