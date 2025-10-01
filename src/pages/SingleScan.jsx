// src/pages/SingleScan.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import QrScanner from 'qr-scanner';
import api from '../utils/api';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';
import FormButton from '../components/ui/FormButton';
import Toast from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const SingleScan = () => {
  const [qrCode, setQrCode] = useState('');
  const [product, setProduct] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [photoScanning, setPhotoScanning] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [existingProduct, setExistingProduct] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Mock categories from the requirements
  const categories = ['Sofa', 'Kursi', 'Meja', 'Sungkai', 'Nakas', 'Buffet'];

  // Mock status options from the requirements
  const statusOptions = ['TOKO', 'GUDANG KEPATHIAN', 'GUDANG NGUNUT', 'TERJUAL'];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setError('Silakan masukkan atau pindai kode QR');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/scan', { qr_code: qrCode.trim() });
      
      if (response.data.success) {
        if (response.data.exists) {
          // Product exists, show confirmation modal
          setExistingProduct(response.data.product);
          setShowEditConfirm(true);
        } else {
          // Product doesn't exist, show registration form with QR code
          setProduct({
            qr_code: response.data.qr_code,
            category: '',
            product_name: '',
            status: 'TOKO'
          });
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

  // Handle existing product confirmation
  const handleEditConfirm = () => {
    setProduct(existingProduct);
    setShowEditConfirm(false);
    setExistingProduct(null);
  };

  const handleEditCancel = () => {
    setShowEditConfirm(false);
    setExistingProduct(null);
    setQrCode('');
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const confirmProductSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (product.id) {
        // Update existing product
        const response = await api.put('/products', {
          id: product.id,
          category: product.category,
          product_name: product.product_name,
          color: product.color, // Include color when updating
          status: product.status
        });

        if (response.data.success) {
          showToast('Produk berhasil diperbarui', 'success');
          setProduct(null);
          setQrCode('');
        } else {
          setError(response.data.message);
        }
      } else {
        // Register new product
        const response = await api.post('/products', {
          action: 'register',
          qr_code: product.qr_code,
          category: product.category,
          product_name: product.product_name,
          color: product.color, // Include color when registering
          status: product.status
        });

        if (response.data.success) {
          showToast('Produk berhasil didaftarkan', 'success');
          setProduct(null);
          setQrCode('');
        } else {
          setError(response.data.message);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (field, value) => {
    if (field === 'category') {
      // Clear product name first when category changes
      setProduct(prev => ({
        ...prev,
        category: value,
        product_name: '',
        color: '#3B82F6', // Reset color when category changes
        productNames: []
      }));

      // Fetch product names based on the selected category
      if (value) {
        try {
          const response = await api.get(`/templates/by-category?category=${value}`);
          if (response.data.success) {
            // Store template data with colors
            setProduct(prev => ({
              ...prev,
              productNames: response.data.data // Keep full template objects with colors
            }));
          } else {
            setError(response.data.message || 'Gagal mengambil nama produk');
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil nama produk');
        }
      }
    } else if (field === 'product_name') {
      // When product name is selected, also set the available colors from the template
      const selectedTemplate = product.productNames?.find(template => template.product_name === value);

      // Ensure colors is always an array of objects
      let availableColors = [];
      if (selectedTemplate) {
        if (Array.isArray(selectedTemplate.colors) && selectedTemplate.colors.length > 0) {
          availableColors = selectedTemplate.colors;
        } else if (Array.isArray(selectedTemplate.color)) {
          // Handle the case where color field contains the array
          availableColors = selectedTemplate.color;
        } else if (typeof selectedTemplate.color === 'string') {
          // Legacy single color format
          availableColors = [{ name: 'Default', hex: selectedTemplate.color }];
        } else {
          // Default fallback
          availableColors = [{ name: 'Default', hex: '#3B82F6' }];
        }
      }

      setProduct(prev => ({
        ...prev,
        product_name: value,
        availableColors: availableColors,
        color: '' // Clear selected color - user will choose
      }));
    } else {
      setProduct(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // QR Camera Scanner Functions
  const startCameraScan = () => {
    setPhotoScanning(true);
  };

  const stopCameraScan = () => {
    setPhotoScanning(false);
  };

  const scanFromImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setPhotoScanning(true);
      const result = await QrScanner.scanImage(file);
      setQrCode(result);
      setPhotoScanning(false);
      // Auto-submit immediately after QR scan
      handleScan();
    } catch (error) {
      setPhotoScanning(false);
      setError('QR Code tidak ditemukan dalam gambar');
    }
  };

  useEffect(() => {
    let scanner = null;

    if (photoScanning && webcamRef.current) {
      scanner = new QrScanner(
        webcamRef.current.video,
        (result) => {
          // Automatically set the QR code value and submit
          setQrCode(result.data);
          setPhotoScanning(false);
          // Auto-submit immediately after scanning
          handleScan();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scanner.start().catch((error) => {
        console.error('Camera scan error:', error);
        setError('Gagal mengakses kamera: ' + error.message);
        setPhotoScanning(false);
      });
    }

    return () => {
      if (scanner) {
        scanner.destroy();
      }
    };
  }, [photoScanning]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Single Scan</h1>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
        <FormInput
          label="Kode QR"
          name="qrCode"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          placeholder="Masukkan kode QR atau gunakan pemindai"
          className="mb-4"
        />

        <div className="mb-4 flex">
          <FormButton
            type="button"
            variant="outline"
            onClick={startCameraScan}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Kamera
          </FormButton>
          <FormButton
            type="button"
            variant="outline"
            onClick={scanFromImage}
            className="ml-2"
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Gambar
          </FormButton>
          <FormButton
            variant="primary"
            onClick={handleScan}
            loading={loading}
            className="ml-2"
          >
            {loading ? 'Memproses...' : 'Pindai'}
          </FormButton>
        </div>

        {/* Hidden file input for image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
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

        {product && (
          <form onSubmit={handleProductSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kode QR</label>
              <div className="mt-1 text-gray-900 font-medium bg-gray-100 p-3 rounded">
                {product.qr_code}
              </div>
            </div>

            <FormSelect
              label="Kategori Produk"
              name="category"
              value={product.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="Pilih kategori"
              required
              options={categories.map(category => ({
                value: category,
                label: category
              }))}
            />

            <FormSelect
              label="Nama Produk"
              name="product_name"
              value={product.product_name}
              onChange={(e) => handleInputChange('product_name', e.target.value)}
              placeholder="Pilih nama produk"
              required
              options={product.productNames && product.productNames.map(template => {
                // Get primary color or default
                const primaryColor = Array.isArray(template.colors) && template.colors.length > 0
                  ? template.colors[0].hex
                  : (typeof template.color === 'string' ? template.color : '#3B82F6');
                const colorCount = Array.isArray(template.colors) ? template.colors.length : 1;

                return {
                  value: template.product_name,
                  label: (
                    <div className="flex items-center">
                      <span
                        className="inline-block w-4 h-4 rounded mr-2 border"
                        style={{ backgroundColor: primaryColor }}
                        title={`Warna: ${primaryColor}${colorCount > 1 ? ` (+${colorCount - 1} warna)` : ''}`}
                      />
                      {template.product_name}
                    </div>
                  )
                };
              })}
            />

            <FormSelect
              label="Warna Produk"
              name="color"
              value={product.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              placeholder="Pilih warna"
              required
              options={product.availableColors && product.availableColors.map((colorOption, index) => ({
                value: colorOption.hex,
                label: `🎨 ${colorOption.name} (${colorOption.hex})`
              }))}
            />

            <FormSelect
              label="Status"
              name="status"
              value={product.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              placeholder="Pilih status"
              required
              options={statusOptions.map(status => ({
                value: status,
                label: status
              }))}
            />

            <div className="flex space-x-3 pt-4">
              <FormButton
                type="submit"
                variant="primary"
                loading={loading}
              >
                {loading ? 'Memproses...' : product.id ? 'Perbarui Produk' : 'Daftarkan Produk'}
              </FormButton>
              <FormButton
                type="button"
                variant="outline"
                onClick={() => {
                  setProduct(null);
                  setQrCode('');
                }}
              >
                Batal
              </FormButton>
            </div>
          </form>
        )}

        {!product && !loading && (
          <div className="text-center py-10 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Pindai kode QR</h3>
            <p className="mt-1 text-sm text-gray-500">Masukkan kode QR untuk melihat atau mendaftarkan produk</p>
          </div>
        )}


        {/* Styled Modals */}
        <Modal
          isOpen={showEditConfirm}
          onClose={handleEditCancel}
          title="Produk Sudah Terdaftar"
          footer={
            <div className="flex space-x-3">
              <FormButton
                variant="primary"
                onClick={handleEditConfirm}
                className="flex-1"
              >
                ✏️ Edit Produk
              </FormButton>
              <FormButton
                variant="outline"
                onClick={handleEditCancel}
                className="flex-1"
              >
                ❌ Batal
              </FormButton>
            </div>
          }
        >
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Produk dengan kode QR <strong>{existingProduct?.qr_code}</strong> sudah terdaftar dalam sistem.
            </p>

            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Kategori:</span>
                <span className="text-sm text-gray-900">{existingProduct?.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Nama Produk:</span>
                <span className="text-sm text-gray-900">{existingProduct?.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className="text-sm text-gray-900">{existingProduct?.status}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Apa yang ingin Anda lakukan?
          </p>
        </Modal>

        <Modal
          isOpen={photoScanning}
          onClose={stopCameraScan}
          title="Pemindai QR Code"
          footer={
            <div className="flex space-x-3">
              <FormButton
                variant="outline"
                onClick={stopCameraScan}
                className="flex-1"
              >
                Tutup
              </FormButton>
              <FormButton
                variant="secondary"
                onClick={scanFromImage}
                className="flex-1"
              >
                Dari Gambar
              </FormButton>
            </div>
          }
        >
          <div className="relative">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: { exact: "environment" }
              }}
              className="w-full h-64 bg-gray-100 rounded"
            />
            <div className="absolute inset-0 border-2 border-blue-500 rounded pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-300 rounded"></div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 mt-4">
            Arahkan camera ke QR Code untuk memindai
          </div>
        </Modal>

        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          title="Konfirmasi Simpan"
          message={`Apakah Anda yakin ingin ${product?.id ? 'memperbarui' : 'mendaftarkan'} produk ini?`}
          confirmText={product?.id ? 'Perbarui' : 'Daftarkan'}
          onConfirm={confirmProductSubmit}
          loading={loading}
        />

        {/* Toast notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={3000}
            onClose={hideToast}
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default SingleScan;
