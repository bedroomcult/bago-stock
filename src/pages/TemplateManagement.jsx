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
        setFormData({ category: '', product_name: '', is_active: true });
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
    setFormData({ category: '', product_name: '', is_active: true });
    setFormVisible(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle template editing
  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      category: template.category,
      product_name: template.product_name,
      is_active: template.is_active
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
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('created_at')}
                    >
                      Dibuat{getSortArrow('created_at')}
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

                    return (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {template.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {template.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {template.created_at ? new Date(template.created_at).toLocaleDateString('id-ID') : '-'}
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
                        setFormData({ category: '', product_name: '', is_active: true });
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
