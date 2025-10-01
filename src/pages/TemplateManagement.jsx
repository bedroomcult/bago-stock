// src/pages/TemplateManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const TemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [formVisible, setFormVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    product_name: '',
    colors: [{ name: 'Default', hex: '#3B82F6' }],
    is_active: true
  });
  const [error, setError] = useState('');

  const categories = ['Sofa', 'Kursi', 'Meja', 'Sungkai', 'Nakas', 'Buffet'];

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    // Apply filtering and sorting when templates, searchTerm, or sortConfig changes
    let filtered = [...templates];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(template =>
        template.category.toLowerCase().includes(term) ||
        template.product_name.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle different data types
        if (sortConfig.key === 'is_active') {
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, sortConfig]);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates');
      if (response.data.success) {
        console.log('Templates data:', response.data.data);
        setTemplates(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      if (editingTemplate) {
        // Update existing template
        response = await api.put('/templates', {
          id: editingTemplate.id,
          ...formData
        });
      } else {
        // Create new template
        response = await api.post('/templates', formData);
      }

      if (response.data.success) {
        fetchTemplates();
        setFormVisible(false);
        setEditingTemplate(null);
        setFormData({ category: '', product_name: '', colors: [{ name: 'Default', hex: '#3B82F6' }], is_active: true });
        alert(editingTemplate ? 'Template berhasil diperbarui' : 'Template berhasil ditambahkan');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan template');
    }
  };



  const handleDelete = async (id) => {
    console.log('Deleting template with ID:', id);
    if (!window.confirm('Apakah Anda yakin ingin menghapus template ini?')) {
      return;
    }

    try {
      const response = await api.delete(`/templates/${id}`);
      if (response.data.success) {
        fetchTemplates();
        alert('Template berhasil dihapus');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menghapus template');
    }
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setFormData({ category: '', product_name: '', colors: [{ name: 'Default', hex: '#3B82F6' }], is_active: true });
    setFormVisible(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Color management functions
  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: `Color ${prev.colors.length + 1}`, hex: '#3B82F6' }]
    }));
  };

  const removeColor = (index) => {
    if (formData.colors.length <= 1) return; // Keep at least one color
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const updateColor = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) =>
        i === index ? { ...color, [field]: value } : color
      )
    }));
  };

  // Handle colors array initialization from template data
  const handleEdit = (template) => {
    setEditingTemplate(template);

    // Parse colors data the same way as display logic
    let colorsArray = [];
    try {
      // New schema: colors JSONB field
      if (typeof template.colors === 'string') {
        colorsArray = JSON.parse(template.colors);
      } else if (Array.isArray(template.colors)) {
        colorsArray = template.colors;
      }
      // If colors field not found or empty, check old color field
      else if (!Array.isArray(colorsArray) || colorsArray.length === 0) {
        // Old schema: color field might be an array (migrated data)
        if (Array.isArray(template.color)) {
          colorsArray = template.color;
        }
        // Old schema: color field might be a string (single color)
        else if (typeof template.color === 'string') {
          colorsArray = [{ name: 'Default', hex: template.color }];
        }
      }
    } catch (e) {
      colorsArray = [];
    }

    // Final fallback if still no colors
    if (!Array.isArray(colorsArray) || colorsArray.length === 0) {
      colorsArray = [{ name: 'Default', hex: '#3B82F6' }];
    }

    setFormData({
      category: template.category,
      product_name: template.product_name,
      colors: colorsArray,
      is_active: template.is_active
    });
    setFormVisible(true);
  };

  const handleNewUser = () => {
    setEditingTemplate(null);
    setFormData({
      category: '',
      product_name: '',
      colors: [{ name: 'Default', hex: '#3B82F6' }],
      is_active: true
    });
    setFormVisible(true);
  };

  // Sorting functions
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sort arrow for column headers
  const getSortArrow = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Template Produk</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Daftar Template</h2>
            <button
              onClick={handleNewTemplate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Tambah Template
            </button>
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari kategori atau nama produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 00 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('category')}
                    >
                      Kategori{getSortArrow('category')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('product_name')}
                    >
                      Nama Produk{getSortArrow('product_name')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Warna
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('is_active')}
                    >
                      Status{getSortArrow('is_active')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTemplates.map((template) => {
                    console.log('Template colors data:', JSON.stringify(template.colors));

                    // Handle colors display - handle new schema (colors JSONB) and old schema (color array/string)
                    let colorsArray = [];
                    try {
                      // New schema: colors JSONB field
                      if (typeof template.colors === 'string') {
                        colorsArray = JSON.parse(template.colors);
                      } else if (Array.isArray(template.colors)) {
                        colorsArray = template.colors;
                      }
                      // If colors field not found or empty, check old color field
                      else if (!Array.isArray(colorsArray) || colorsArray.length === 0) {
                        // Old schema: color field might be an array (migrated data)
                        if (Array.isArray(template.color)) {
                          colorsArray = template.color;
                        }
                        // Old schema: color field might be a string (single color)
                        else if (typeof template.color === 'string') {
                          colorsArray = [{ name: 'Default', hex: template.color }];
                        }
                      }
                    } catch (e) {
                      colorsArray = [];
                    }

                    // Final fallback if still no colors
                    if (!Array.isArray(colorsArray) || colorsArray.length === 0) {
                      colorsArray = [{ name: 'Default', hex: '#3B82F6' }];
                    }

                    const displayColors = colorsArray.slice(0, 4); // Show max 4 colors
                    const remainingCount = colorsArray.length - 4;

                    return (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {template.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {template.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {displayColors.map((color, index) => (
                              <div
                                key={index}
                                className="w-5 h-5 rounded border border-gray-200 flex-shrink-0"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                            {remainingCount > 0 && (
                              <span className="text-xs text-gray-500 ml-1">
                                +{remainingCount} more
                              </span>
                            )}
                            {colorsArray.length > 1 && (
                              <span className="text-xs text-gray-600 ml-2">
                                {colorsArray.length} colors
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            template.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {template.is_active ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              console.log('Editing template:', template);
                              if (template && template.id) {
                                handleEdit(template);
                              } else {
                                setError('Template ID tidak ditemukan.');
                              }
                            }}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
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

        {/* Template Form Modal */}
        {formVisible && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingTemplate ? 'Edit Template' : 'Tambah Template Baru'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      required
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Pilih kategori</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      id="product_name"
                      value={formData.product_name}
                      onChange={(e) => handleInputChange('product_name', e.target.value)}
                      required
                      placeholder="Nama produk"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Pilihan Warna Produk
                      </label>
                      <button
                        type="button"
                        onClick={addColor}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        + Tambah Warna
                      </button>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {formData.colors.map((color, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50">
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="color"
                              value={color.hex}
                              onChange={(e) => updateColor(index, 'hex', e.target.value)}
                              className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                              title={`Pilih warna untuk ${color.name}`}
                            />
                            <input
                              type="text"
                              value={color.name}
                              onChange={(e) => updateColor(index, 'name', e.target.value)}
                              placeholder="Nama warna"
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              value={color.hex}
                              onChange={(e) => updateColor(index, 'hex', e.target.value)}
                              placeholder="#3B82F6"
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                              title="Kode warna hex"
                            />
                            <div
                              className="w-8 h-8 rounded border border-gray-300"
                              style={{ backgroundColor: color.hex }}
                              title="Pratinjau warna"
                            />
                          </div>
                          {formData.colors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeColor(index)}
                              className="text-red-500 hover:text-red-700 text-lg"
                              title="Hapus warna ini"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      Pilihan warna ini akan ditampilkan di SingleScan untuk dipilih saat mendaftarkan produk
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Aktif
                    </label>
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-50 p-2">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 00 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
                      className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {editingTemplate ? 'Perbarui' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormVisible(false);
                        setEditingTemplate(null);
                        setFormData({ category: '', product_name: '', colors: [{ name: 'Default', hex: '#3B82F6' }], is_active: true });
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

        {/* Debug: Show colors data for troubleshooting */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-yellow-100 p-2 text-xs rounded shadow">
            Templates loaded: {templates.length}
            <br />
            Filtered: {filteredTemplates.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManagement;
