// src/pages/DetailStok.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const DetailStok = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productCounts, setProductCounts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [emptyStockTemplates, setEmptyStockTemplates] = useState([]); // New state for empty stock templates
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [viewMode, setViewMode] = useState('products'); // 'products' or 'empty-stock'

  // Dynamic location mappings fetched from database
  const [locationConfig, setLocationConfig] = useState({});
  const [availableStatuses, setAvailableStatuses] = useState([]);

  // Color mappings for different locations - loaded after statuses are fetched
  const getLocationColor = (index) => {
    const colors = [
      { bg: 'bg-green-100', text: 'text-green-800', icon: '🏪' },
      { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🏭' },
      { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🏗️' },
      { bg: 'bg-purple-100', text: 'text-purple-800', icon: '💰' },
      { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴' },
      { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: '💠' },
      { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' },
      { bg: 'bg-pink-100', text: 'text-pink-800', icon: '💖' }
    ];
    return colors[index % colors.length];
  };

  const fetchStatuses = async () => {
    try {
      const response = await api.get('/products/statuses');
      if (response.data.success) {
        const statuses = response.data.data;
        setAvailableStatuses(statuses);

        // Create location config from fetched statuses
        const config = {};
        statuses.forEach((status, index) => {
          const colorInfo = getLocationColor(index);
          config[status] = {
            label: status, // Use the actual status string as label
            color: `${colorInfo.bg} ${colorInfo.text}`,
            icon: colorInfo.icon
          };
        });

        setLocationConfig(config);
        console.log('📍 Location config loaded from database:', config);
      } else {
        console.error('Failed to fetch statuses:', response.data.message);
        // Fallback config if API fails
        setLocationConfig({
          'TOKO': { label: 'TOKO', color: 'bg-green-100 text-green-800', icon: '🏪' },
          'GUDANG KEPATHIAN': { label: 'GUDANG KEPATHIAN', color: 'bg-blue-100 text-blue-800', icon: '🏭' }
        });
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
      // Fallback config if API fails
      setLocationConfig({
        'TOKO': { label: 'TOKO', color: 'bg-green-100 text-green-800', icon: '🏪' },
        'GUDANG KEPATHIAN': { label: 'GUDANG KEPATHIAN', color: 'bg-blue-100 text-blue-800', icon: '🏭' }
      });
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStatuses();
    fetchAllProducts();
    fetchEmptyStockTemplates(); // Fetch empty stock templates
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/templates'); // Assuming /templates returns categories
      if (response.data.success) {
        // Extract unique categories from templates to avoid duplicates
        const uniqueCategories = [...new Set(response.data.data.map(item => item.category))];
        setCategories(['Semua Produk', ...uniqueCategories]);
      } else {
        console.error('Failed to fetch categories:', response.data.message);
        setCategories(['Semua Produk', 'Sofa', 'Kursi', 'Meja', 'Sungkai', 'Nakas', 'Buffet']); // Fallback
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['Semua Produk', 'Sofa', 'Kursi', 'Meja', 'Sungkai', 'Nakas', 'Buffet']); // Fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      // Use the new detail endpoint that returns full product information
      const response = await api.get('/products/detail');
      if (response.data.success) {
        console.log('📊 Product details loaded:', response.data.data);
        const products = response.data.data;
        setAllProducts(products);
        setFilteredProducts(products);
        setProductCounts([]); // Clear old format since we're using new structure
      } else {
        console.error('❌ Failed to fetch products:', response.data.message);
        setAllProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('🚨 Error fetching products:', error);
      setAllProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch empty stock templates
  const fetchEmptyStockTemplates = async () => {
    try {
      const response = await api.get('/templates/empty-stock');
      if (response.data.success) {
        console.log('📦 Empty stock templates loaded:', response.data.data);
        setEmptyStockTemplates(response.data.data);
      } else {
        console.error('❌ Failed to fetch empty stock templates:', response.data.message);
        setEmptyStockTemplates([]);
      }
    } catch (error) {
      console.error('🚨 Error fetching empty stock templates:', error);
      setEmptyStockTemplates([]);
    }
  };

  // Filter products based on search, location, and category
  useEffect(() => {
    let filtered = allProducts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.uuid.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(product => product.status === selectedLocation);
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [allProducts, searchTerm, selectedLocation, selectedCategory]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  // Calculate statistics
  const totalProducts = filteredProducts.length;
  const lowStockCount = filteredProducts.filter(p => p.count <= 5).length;
  const activeProducts = filteredProducts.filter(p => p.status === 'TOKO').length;
  const emptyStockCount = emptyStockTemplates.length;

  // Product detail popup state
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);

  // Function to show product detail popup
  const handleShowProductDetail = (product) => {
    setSelectedProductDetail(product);
    setShowProductDetail(true);
  };

  // Function to close product detail popup
  const handleCloseProductDetail = () => {
    setShowProductDetail(false);
    setSelectedProductDetail(null);
  };

  // Function to handle registration of an empty template
  const handleRegisterEmptyTemplate = async (template) => {
    // Redirect to SingleScan page with template pre-filled
    // In a real implementation, you might want to open a modal or form here
    alert(`Redirecting to register: ${template.category} - ${template.product_name}`);
    // For now, we'll just log the action
    console.log('Registering template:', template);

    // Navigate to SingleScan page with template data
    // This would typically use React Router's history.push or similar
    window.location.href = `/single-scan?category=${encodeURIComponent(template.category)}&product_name=${encodeURIComponent(template.product_name)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Detail Stok</h1>
          <p className="text-sm text-gray-600">Manajemen inventaris produk furniture</p>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('products')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                viewMode === 'products'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Produk Terdaftar ({totalProducts})
            </button>
            <button
              onClick={() => setViewMode('empty-stock')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                viewMode === 'empty-stock'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Template Kosong ({emptyStockCount})
            </button>
          </div>
        </div>

        {/* Statistics Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{viewMode === 'products' ? totalProducts : emptyStockCount}</div>
              <div className="text-xs sm:text-sm text-gray-600">
                {viewMode === 'products' ? 'Total Produk' : 'Template Kosong'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{lowStockCount}</div>
              <div className="text-xs sm:text-sm text-gray-600">Stok Rendah</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
              <div className="text-xs sm:text-sm text-gray-600">Di Toko</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(locationConfig).length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Lokasi</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={
                    viewMode === 'products' 
                      ? "Cari berdasarkan nama produk atau QR code..." 
                      : "Cari berdasarkan nama template..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Location Filter (only for products view) */}
            {viewMode === 'products' && (
              <div className="sm:w-48">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">📍 Semua Lokasi</option>
                  {Object.entries(locationConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Category Selection (Original style maintained) - only for products view */}
        {viewMode === 'products' && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Filter Berdasarkan Kategori</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-2 sm:gap-3">
              {categories.slice(1).map((category) => ( // Skip "Semua Produk" since we have all products view
                <button
                  key={category}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleCategoryClick(category === selectedCategory ? null : category)}
                >
                  {category}
                  {selectedCategory === category && (
                    <span className="ml-1">✕</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Memuat data produk...</p>
          </div>
        ) : (
          /* Content based on view mode */
          <>
            {viewMode === 'products' ? (
              /* Product Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const locationInfo = locationConfig[product.status] || locationConfig['TOKO'];
                    const isLowStock = product.count <= 5;

                    return (
                      <div key={product.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        {/* Product Header */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">
                              {product.product_name}
                            </h3>
                            <div className="flex items-center space-x-1">
                              <div
                                className="w-4 h-4 rounded border border-gray-30 flex-shrink-0"
                                style={{ backgroundColor: product.color || '#3B82F6' }}
                                title={`Warna: ${product.color || '#3B82F6'}`}
                              />
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${locationInfo.color} flex-shrink-0`}>
                                {locationInfo.icon}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            QR: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">{product.uuid}</span>
                          </p>
                        </div>

                        {/* Product Body */}
                        <div className="p-4">
                          {/* Status and Count */}
                          <div className="flex items-center justify-between mb-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${locationInfo.color}`}>
                              {locationInfo.label}
                            </span>
                            <span className={`text-sm font-semibold ${
                              isLowStock ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {product.count} pcs
                            </span>
                          </div>

                          {/* Low Stock Alert */}
                          {isLowStock && (
                            <div className="mb-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ⚠️ Stok Rendah
                              </span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleShowProductDetail(product)}
                              className="w-full bg-green-50 text-green-700 px-3 py-2 rounded-md text-xs font-medium hover:bg-green-100 transition-colors"
                            >
                              📊 Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchTerm ? 'Tidak ada produk yang cocok' : 'Tidak ada produk'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'Coba ubah kata kunci pencarian atau filter lokasi' : 'Belum ada produk yang terdaftar'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Empty Stock Templates Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {emptyStockTemplates.length > 0 ? (
                  emptyStockTemplates
                    .filter(template => 
                      template.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      template.category.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((template) => (
                      <div key={`${template.category}-${template.product_name}`} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        {/* Template Header */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">
                              {template.product_name}
                            </h3>
                            <div className="flex items-center space-x-1">
                              <div
                                className="w-4 h-4 rounded border border-gray-30 flex-shrink-0"
                                style={{ backgroundColor: template.color || '#3B82F6' }}
                                title={`Warna: ${template.color || '#3B82F6'}`}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Kategori: <span className="font-medium">{template.category}</span>
                          </p>
                        </div>

                        {/* Template Body */}
                        <div className="p-4">
                          {/* Status */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              🔷 Template
                            </span>
                            <span className="text-sm font-semibold text-gray-500">
                              0 pcs
                            </span>
                          </div>

                          {/* Empty Stock Alert */}
                          <div className="mb-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              ⚠️ Belum Terdaftar
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleRegisterEmptyTemplate(template)}
                              className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-md text-xs font-medium hover:bg-green-100 transition-colors"
                            >
                              ➕ Daftarkan
                            </button>
                            <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors">
                              📊 Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchTerm ? 'Tidak ada template yang cocok' : 'Semua template sudah terdaftar'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm 
                        ? 'Coba ubah kata kunci pencarian' 
                        : 'Semua template produk sudah memiliki produk terdaftar'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Product Detail Popup Modal */}
        {showProductDetail && selectedProductDetail && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Detail Stok: {selectedProductDetail.product_name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: selectedProductDetail.color || '#3B82F6' }}
                        title={`Warna: ${selectedProductDetail.color || '#3B82F6'}`}
                      />
                      <span className="text-sm text-gray-600">
                        {selectedProductDetail.color || '#3B82F6'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseProductDetail}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Product Summary */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{selectedProductDetail.count}</div>
                      <div className="text-sm text-gray-600">Total Stok</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800">{selectedProductDetail.category}</div>
                      <div className="text-sm text-gray-600">Kategori</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {selectedProductDetail.items?.filter(item => item.status === 'TOKO').length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Di Toko</div>
                    </div>
                  </div>
                </div>

                {/* Stock Distribution by Status */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Distribusi Stok Berdasarkan Lokasi/Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(
                      selectedProductDetail.items?.reduce((acc, item) => {
                        acc[item.status] = (acc[item.status] || 0) + 1;
                        return acc;
                      }, {}) || {}
                    ).map(([status, count]) => {
                      const locationInfo = locationConfig[status] || locationConfig['TOKO'];
                      return (
                        <div key={status} className="bg-white border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${locationInfo.color}`}>
                                {locationInfo.icon} {locationInfo.label}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">{count}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {(count / selectedProductDetail.count * 100).toFixed(1)}% dari total stok
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Individual Items List */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Daftar Item Individual</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {selectedProductDetail.items?.map((item, index) => {
                        const locationInfo = locationConfig[item.status] || locationConfig['TOKO'];
                        return (
                          <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-md border">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-mono text-gray-500">#{index + 1}</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${locationInfo.color}`}>
                                {locationInfo.icon} {locationInfo.label}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: item.color || '#3B82F6' }}
                                title={`Warna: ${item.color || '#3B82F6'}`}
                              />
                              <span className="text-xs font-mono text-gray-500">
                                {item.uuid.substring(0, 8)}...
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(item.created_at).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={handleCloseProductDetail}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailStok;
