// src/pages/DetailStok.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ConfirmDialog from '../components/ui/ConfirmDialog';

// Safe color parsing utility - color comes as JSON array [{"hex": "#ffffff","name": "-"}]
const getSafeColors = (colorData) => {
  const DEFAULT_COLORS = [{ hex: '#ffffff', name: '-' }];

  if (!colorData) return DEFAULT_COLORS;

  try {
    // If it's a JSON string, parse it
    if (typeof colorData === 'string') {
      const parsed = JSON.parse(colorData);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_COLORS;
    }

    // If it's already an array, return it
    if (Array.isArray(colorData)) {
      return colorData.length > 0 ? colorData : DEFAULT_COLORS;
    }

    // Fallback for unexpected formats
    return DEFAULT_COLORS;
  } catch (error) {
    console.warn('Failed to parse color data:', colorData, error);
    return DEFAULT_COLORS;
  }
};

const DetailStok = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productCounts, setProductCounts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [soldProducts, setSoldProducts] = useState([]);
  const [dalamProsesProducts, setDalamProsesProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredSoldProducts, setFilteredSoldProducts] = useState([]);
  const [filteredDalamProsesProducts, setFilteredDalamProsesProducts] = useState([]);
  const [emptyStockTemplates, setEmptyStockTemplates] = useState([]); // New state for empty stock templates
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [viewMode, setViewMode] = useState('products'); // 'products', 'empty-stock', 'sold-items', or 'dalam-proses'

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
    fetchDalamProsesProducts(); // Fetch dalam proses products
    fetchEmptyStockTemplates(); // Fetch empty stock templates
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Try admin endpoint first
      let response = await api.get('/templates');

      // If admin endpoint fails (401/403), try user-level endpoint
      if (response.status >= 400 && response.status < 500) {
        console.warn('Admin templates endpoint failed, trying user endpoint:', response.status);
        response = await api.get('/templates/by-category?category=Sofa'); // Get one category to extract all categories

        if (response.data.success && response.data.data.length > 0) {
          // Extract unique categories from available templates
          const availableCategories = ['Sofa']; // Initialize with the one we queried
          // Since templates/by-category only returns one category, let's use fallback for all
          const fallbackCategories = ['Semua Produk', 'Sofa', 'Kursi', 'Meja', 'Sungkai', 'Nakas', 'Buffet'];
          setCategories(fallbackCategories);
        } else {
          throw new Error('User templates endpoint also failed');
        }
      } else if (response.data.success) {
        // Admin endpoint worked
        const uniqueCategories = [...new Set(response.data.data.map(item => item.category))];
        setCategories(['Semua Produk', ...uniqueCategories]);
      } else {
        console.error('Failed to fetch categories:', response.data.message);
        setCategories(['Semua Produk', 'Sofa', 'Kursi', 'Meja', 'Sungkai', 'Nakas', 'Buffet']); // Fallback
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Ensure we always have categories to prevent blank pages
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

        // Separate active products from sold products
        const activeProducts = response.data.data.filter(product => product.status !== 'TERJUAL');
        const soldItems = response.data.data.filter(product => product.status === 'TERJUAL');

        setAllProducts(activeProducts);
        setSoldProducts(soldItems);
        setFilteredProducts(activeProducts);
        setFilteredSoldProducts(soldItems);

        setProductCounts([]); // Clear old format since we're using new structure
      } else {
        console.error('❌ Failed to fetch products:', response.data.message);
        setAllProducts([]);
        setSoldProducts([]);
        setFilteredProducts([]);
        setFilteredSoldProducts([]);
      }
    } catch (error) {
      console.error('🚨 Error fetching products:', error);
      setAllProducts([]);
      setSoldProducts([]);
      setFilteredProducts([]);
      setFilteredSoldProducts([]);
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

  // Function to fetch dalam proses products using the dedicated API endpoint
  const fetchDalamProsesProducts = async () => {
    try {
      const response = await api.get('/products/dalam-proses');
      if (response.data.success) {
        console.log('🏭 Dalam proses products loaded:', response.data.data);
        setDalamProsesProducts(response.data.data);
      } else {
        console.error('❌ Failed to fetch dalam proses products:', response.data.message);
        setDalamProsesProducts([]);
      }
    } catch (error) {
      console.error('🚨 Error fetching dalam proses products:', error);
      setDalamProsesProducts([]);
    }
  };

  // Filter products and sold items based on view mode, search, location, and category
  useEffect(() => {
    // Filter active products
    let filteredActive = allProducts;

    // Filter by search term
    if (searchTerm) {
      filteredActive = filteredActive.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.qr_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filteredActive = filteredActive.filter(product => product.status === selectedLocation);
    }

    // Filter by category
    if (selectedCategory) {
      filteredActive = filteredActive.filter(product => product.category === selectedCategory);
    }

    // Filter sold products
    let filteredSold = soldProducts;

    // Filter by search term
    if (searchTerm) {
      filteredSold = filteredSold.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.qr_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category (sold items can still be filtered by category)
    if (selectedCategory) {
      filteredSold = filteredSold.filter(product => product.category === selectedCategory);
    }

    // Filter manufacturing process products from the dedicated API
    let filteredDalamProses = dalamProsesProducts;

    // Filter by search term
    if (searchTerm) {
      filteredDalamProses = filteredDalamProses.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.qr_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filteredDalamProses = filteredDalamProses.filter(product => product.status === selectedLocation);
    }

    // Filter by category
    if (selectedCategory) {
      filteredDalamProses = filteredDalamProses.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filteredActive);
    setFilteredSoldProducts(filteredSold);
    setFilteredDalamProsesProducts(filteredDalamProses);
  }, [allProducts, soldProducts, dalamProsesProducts, searchTerm, selectedLocation, selectedCategory]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  // Calculate statistics
  // Count individual items (ungrouped), not grouped products
  const totalProducts = allProducts
    .filter(product => product.status !== 'TERJUAL' && !product.dalam_proses)
    .reduce((sum, product) => sum + product.count, 0);

  const soldProductsCount = soldProducts.reduce((sum, product) => sum + product.count, 0);

  const lowStockCount = filteredProducts.filter(p => p.count <= 5).length;
  const activeProducts = filteredProducts.filter(p => p.status === 'TOKO').length;
  const emptyStockCount = emptyStockTemplates.length;

  const dalamProsesProductsCount = dalamProsesProducts.reduce((sum, product) => sum + product.count, 0);

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

  // State for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // State for DALAM PROSES modal
  const [showDalamProsesModal, setShowDalamProsesModal] = useState(false);
  const [dalamProsesForm, setDalamProsesForm] = useState({
    category: '',
    product_name: '',
    color: '#3B82F6'
  });
  const [dalamProsesTemplateOptions, setDalamProsesTemplateOptions] = useState([]);
  const [dalamProsesAvailableColors, setDalamProsesAvailableColors] = useState([]);
  const [error, setError] = useState('');

  // Function to handle registration of an empty template
  const handleRegisterEmptyTemplate = (template) => {
    setSelectedTemplate(template);
    setShowConfirmDialog(true);
  };

  // Function to confirm registration and navigate
  const handleConfirmRegistration = () => {
    if (!selectedTemplate) return;

    setShowConfirmDialog(false);
    const template = selectedTemplate;
    setSelectedTemplate(null);

    // Navigate to SingleScan page with template data
    window.location.href = `/single-scan?category=${encodeURIComponent(template.category)}&product_name=${encodeURIComponent(template.product_name)}`;
  };

  // Function to cancel registration
  const handleCancelRegistration = () => {
    setShowConfirmDialog(false);
    setSelectedTemplate(null);
  };

  // Function to handle DALAM PROSES submission
  const handleDalamProsesSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!dalamProsesForm.category || !dalamProsesForm.product_name) {
      setError('Kategori dan nama produk wajib diisi');
      return;
    }

    try {
      const response = await api.post('/products', {
        action: 'create-dalam-proses',
        category: dalamProsesForm.category,
        product_name: dalamProsesForm.product_name,
        color: dalamProsesForm.color,
        status: 'TOKO', // Default status for manufacturing products
        dalam_proses: true // Indicate this is a manufacturing process product
      });

      if (response.data.success) {
        setShowDalamProsesModal(false);
        setDalamProsesForm({
          category: '',
          product_name: '',
          color: '#3B82F6'
        });
        fetchAllProducts(); // Refresh the products list
        fetchDalamProsesProducts(); // Refresh dalam proses products
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menambah produk dalam proses');
    }
  };

  const handleDalamProsesInputChange = (field, value) => {
    setDalamProsesForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle category change for DALAM PROSES modal - fetch templates for selected category
  const handleDalamProsesCategoryChange = async (category) => {
    setDalamProsesForm(prev => ({
      ...prev,
      category,
      product_name: '', // Reset product name when category changes
      color: '#3B82F6' // Reset color when category changes
    }));

    if (category) {
      try {
        // Use the by-category endpoint which is accessible to regular authenticated users
        const response = await api.get(`/templates/by-category?category=${encodeURIComponent(category)}`);
        if (response.data.success) {
          setDalamProsesTemplateOptions(response.data.data);
        } else {
          console.error('Failed to fetch templates:', response.data.message);
          setDalamProsesTemplateOptions([]);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        // Fallback: try to provide some default options based on categories
        const fallbackTemplates = [
          { category, product_name: `${category} Standard`, color: '#3B82F6' },
          { category, product_name: `${category} Premium`, color: '#10B981' },
          { category, product_name: `${category} Basic`, color: '#8B5CF6' }
        ];
        setDalamProsesTemplateOptions(fallbackTemplates);
      }
    } else {
      setDalamProsesTemplateOptions([]);
    }
  };

  // Handle product name change for DALAM PROSES modal - auto-fill color from template
  const handleDalamProsesProductChange = (productName) => {
    const selectedTemplate = dalamProsesTemplateOptions.find(template => template.product_name === productName);

    // Extract available colors for this template
    const availableColors = selectedTemplate ? getSafeColors(selectedTemplate.color) : [];
    setDalamProsesAvailableColors(availableColors);

    // Set first available color as default
    const defaultColor = availableColors.length > 0 ? availableColors[0].hex : '#3B82F6';

    setDalamProsesForm(prev => ({
      ...prev,
      product_name: productName,
      color: defaultColor
    }));
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
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex space-x-2 flex-wrap gap-2">
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
              <button
                onClick={() => setViewMode('dalam-proses')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  viewMode === 'dalam-proses'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Dalam Proses ({dalamProsesProductsCount})
              </button>
              <button
                onClick={() => setViewMode('sold-items')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  viewMode === 'sold-items'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Produk Terjual ({soldProductsCount})
              </button>
            </div>
            <button
              onClick={() => setShowDalamProsesModal(true)}
              className="px-4 py-2 text-sm font-medium rounded-md bg-orange-600 text-white hover:bg-orange-700"
            >
              🏭 Tambah Proses Produksi
            </button>
          </div>
        </div>

        {/* Statistics Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {viewMode === 'products' ? totalProducts :
                 viewMode === 'empty-stock' ? emptyStockCount :
                 soldProductsCount}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                {viewMode === 'products' ? 'Total Produk' :
                 viewMode === 'empty-stock' ? 'Template Kosong' :
                 'Produk Terjual'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {viewMode === 'sold-items' ? totalProducts + soldProductsCount : totalProducts}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                {viewMode === 'sold-items' ? 'Total Semua' : 'Produk Aktif'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {viewMode === 'products' ? activeProducts : totalProducts}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                {viewMode === 'products' ? 'Di Toko' : 'Total Aktif'}
              </div>
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
                      : viewMode === 'sold-items'
                      ? "Cari berdasarkan nama produk terjual..."
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

        {/* Category Selection - only for products, dalam-proses, and sold-items views */}
        {(viewMode === 'products' || viewMode === 'dalam-proses' || viewMode === 'sold-items') && categories && categories.length > 1 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Filter Berdasarkan Kategori</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-2 sm:gap-3">
              {categories.slice(1).map((category) => ( // Skip "Semua Produk" since we have all products view
                <button
                  key={category}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    selectedCategory === category
                      ? (viewMode === 'sold-items' ? 'bg-red-600 text-white shadow-md' :
                         viewMode === 'dalam-proses' ? 'bg-purple-600 text-white shadow-md' :
                         'bg-blue-600 text-white shadow-md')
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
                                style={{ backgroundColor: Array.isArray(getSafeColors(product.color)) ? getSafeColors(product.color)[0].hex : product.color || '#3B82F6' }}
                                title={`Warna: ${Array.isArray(getSafeColors(product.color)) ? getSafeColors(product.color)[0].hex : product.color || '#3B82F6'}`}
                              />
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${locationInfo.color} flex-shrink-0`}>
                                {locationInfo.icon}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            QR: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">{product.qr_code}</span>
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
            ) : viewMode === 'dalam-proses' ? (
              /* Dalam Proses Products Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredDalamProsesProducts.length > 0 ? (
                  filteredDalamProsesProducts.map((product) => {
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
                                style={{ backgroundColor: Array.isArray(getSafeColors(product.color)) ? getSafeColors(product.color)[0].hex : product.color || '#3B82F6' }}
                                title={`Warna: ${Array.isArray(getSafeColors(product.color)) ? getSafeColors(product.color)[0].hex : product.color || '#3B82F6'}`}
                              />
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex-shrink-0">
                                🏭 DALAM PROSES
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            — Tanpa QR Code
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

                          {/* Manufacturing Process Alert */}
                          <div className="mb-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              🔄 Dalam Proses Produksi
                            </span>
                          </div>

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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchTerm ? 'Tidak ada produk dalam proses yang cocok' : 'Tidak ada produk dalam proses'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm
                        ? 'Coba ubah kata kunci pencarian atau filter kategori'
                        : 'Belum ada produk dalam proses produksi yang terdaftar'}
                    </p>
                  </div>
                )}
              </div>
            ) : viewMode === 'sold-items' ? (
              /* Sold Items Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredSoldProducts.length > 0 ? (
                  filteredSoldProducts.map((product) => {
                    return (
                      <div key={product.id} className="bg-gray-50 rounded-lg shadow-sm border hover:shadow-md transition-shadow border-gray-200">
                        {/* Product Header - Sold Items */}
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-800 truncate pr-2">
                              {product.product_name}
                            </h3>
                            <div className="flex items-center space-x-1">
                              <div
                                className="w-4 h-4 rounded border border-gray-30 flex-shrink-0 opacity-70"
                                style={{ backgroundColor: Array.isArray(getSafeColors(product.color)) ? getSafeColors(product.color)[0].hex : product.color || '#3B82F6' }}
                                title={`Warna: ${Array.isArray(getSafeColors(product.color)) ? getSafeColors(product.color)[0].hex : product.color || '#3B82F6'}`}
                              />
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex-shrink-0">
                                🛒 TERJUAL
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            QR: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs opacity-70">{product.qr_code}</span>
                          </p>
                        </div>

                        {/* Product Body - Sold Items */}
                        <div className="p-4">
                          {/* Status and Count */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                              📦 Archive
                            </span>
                            <span className="text-sm font-semibold text-red-600">
                              {product.count} pcs
                            </span>
                          </div>

                          {/* Sold Alert */}
                          <div className="mb-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ✅ Terjual
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleShowProductDetail(product)}
                              className="w-full bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
                            >
                              📊 Detail Riwayat
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m-8-4v10l8 4 8-4V7zM4 7V17m16 0V7" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16V7" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchTerm ? 'Tidak ada produk terjual yang cocok' : 'Tidak ada produk terjual'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm
                        ? 'Coba ubah kata kunci pencarian atau filter kategori'
                        : 'Belum ada produk yang memiliki status terjual'}
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
                              className="w-full bg-green-50 text-green-700 px-3 py-2 rounded-md text-xs font-medium hover:bg-green-100 transition-colors"
                            >
                              ➕ Daftarkan
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
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-4 h-4 rounded border flex-shrink-0"
                        style={{ backgroundColor: Array.isArray(getSafeColors(selectedProductDetail.color)) ? getSafeColors(selectedProductDetail.color)[0].hex : selectedProductDetail.color || '#3B82F6' }}
                        title={`Warna: ${Array.isArray(getSafeColors(selectedProductDetail.color)) ? getSafeColors(selectedProductDetail.color)[0].hex : selectedProductDetail.color || '#3B82F6'}`}
                      />
                      <span className="text-xs text-gray-600">
                        {Array.isArray(getSafeColors(selectedProductDetail.color)) ? getSafeColors(selectedProductDetail.color)[0].hex : selectedProductDetail.color || '#3B82F6'}
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
                      selectedProductDetail.items?.filter(item => item && item.status).reduce((acc, item) => {
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

                {/* Stock Distribution by Color */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Stok Berdasarkan Warna</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      const colors = getSafeColors(selectedProductDetail.color);
                      // Distribute total stock evenly across colors (since we don't have per-color stock data)
                      const totalStock = selectedProductDetail.count || 0;
                      const stockPerColor = Math.floor(totalStock / colors.length);
                      const remainder = totalStock % colors.length;

                      return colors.map((color, index) => {
                        const stock = stockPerColor + (index < remainder ? 1 : 0);
                        const percentage = totalStock > 0 ? (stock / totalStock * 100).toFixed(1) : '0.0';

                        return (
                          <div key={`${color.hex || index}`} className="bg-white border rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-8 h-8 rounded border flex-shrink-0"
                                style={{ backgroundColor: color.hex }}
                                title={color.hex}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {color.name || `Color ${index + 1}`}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {color.hex}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">{stock}</div>
                                <div className="text-xs text-gray-600">{percentage}%</div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Individual Items List */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Daftar Item Individual</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {selectedProductDetail.items?.filter(item => item && item.id && item.status).map((item, index) => {
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
                                style={{ backgroundColor: getSafeColors(item.color)[0].hex }}
                                title={`Warna: ${getSafeColors(item.color)[0].hex}`}
                              />
                              <span className="text-xs font-mono text-gray-500">
                                {item.qr_code.substring(0, 8)}...
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

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Konfirmasi Pendaftaran Template"
          message={`Daftarkan template "${selectedTemplate?.product_name || ''}" untuk kategori "${selectedTemplate?.category || ''}"? Anda akan diarahkan ke halaman pemindaian untuk menyelesaikan proses pendaftaran.`}
          confirmText="Ya, Daftar"
          cancelText="Batal"
          confirmType="primary"
          onConfirm={handleConfirmRegistration}
          onCancel={handleCancelRegistration}
        />

        {/* DALAM PROSES Modal */}
        {showDalamProsesModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Tambah Produk Dalam Proses Produksi
                </h3>

                <form onSubmit={handleDalamProsesSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="dalamProsesCategory" className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori Produk
                    </label>
                    <select
                      id="dalamProsesCategory"
                      value={dalamProsesForm.category}
                      onChange={(e) => handleDalamProsesCategoryChange(e.target.value)}
                      required
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Pilih kategori</option>
                      {categories.slice(1).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="dalamProsesProductName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Produk
                    </label>
                    <select
                      id="dalamProsesProductName"
                      value={dalamProsesForm.product_name}
                      onChange={(e) => handleDalamProsesProductChange(e.target.value)}
                      required
                      disabled={!dalamProsesForm.category}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">
                        {!dalamProsesForm.category ? 'Pilih kategori terlebih dahulu' : 'Pilih nama produk'}
                      </option>
                      {dalamProsesTemplateOptions.map((template) => (
                        <option key={`${template.category}-${template.product_name}`} value={template.product_name}>
                          {template.product_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="dalamProsesColor" className="block text-sm font-medium text-gray-700 mb-1">
                      Warna Produk
                    </label>
                    <div className="relative">
                      <select
                        id="dalamProsesColor"
                        value={dalamProsesForm.color}
                        onChange={(e) => handleDalamProsesInputChange('color', e.target.value)}
                        required
                        disabled={!dalamProsesAvailableColors.length}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <option value="">
                          {!dalamProsesForm.product_name ? 'Pilih produk terlebih dahulu' : 'Pilih warna'}
                        </option>
                        {dalamProsesAvailableColors.map((color, index) => (
                          <option key={color.hex || index} value={color.hex}>
                            ◍ {color.name || `Warna ${index + 1}`} - {color.hex}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <div
                          className="w-5 h-5 rounded border border-gray-300"
                          style={{ backgroundColor: dalamProsesForm.color || '#f3f4f6' }}
                          title={`Warna yang dipilih: ${dalamProsesForm.color || 'Belum dipilih'}`}
                        />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Warna otomatis diisi dari template yang dipilih</p>
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-50 p-2">
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

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Tambah ke Proses Produksi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDalamProsesModal(false);
                        setDalamProsesForm({
                          category: '',
                          product_name: '',
                          color: '#3B82F6'
                        });
                        setDalamProsesTemplateOptions([]);
                        setDalamProsesAvailableColors([]);
                        setError('');
                      }}
                      className="inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailStok;
