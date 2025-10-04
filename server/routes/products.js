const express = require('express');
const router = express.Router();
const { getSupabaseClient } = require('../config/supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

// Get unique status values from products
router.get('/statuses', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    // Get distinct status values
    const { data: products, error } = await supabase
      .from('products')
      .select('status');

    if (error) {
      throw error;
    }

    // Extract unique status values
    const uniqueStatuses = [...new Set(products.map(p => p.status))];

    res.json({
      success: true,
      data: uniqueStatuses
    });
  } catch (error) {
    console.error('Get statuses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get status values'
    });
  }
});

// Get products that are currently in manufacturing process (DALAM PROSES)
router.get('/dalam-proses', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    const { data: products, error } = await supabase
      .from('products')
      .select('id, qr_code, category, product_name, status, dalam_proses, created_at, updated_at')
      .eq('dalam_proses', true)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Group and count products by name for dalam-proses view
    const productDetails = products.reduce((acc, product) => {
      const key = `${product.category}-${product.product_name}`;
      if (!acc[key]) {
        acc[key] = {
          id: product.id,
          qr_code: product.qr_code,
          product_name: product.product_name,
          category: product.category,
          status: product.status,
          count: 1,
          last_updated: product.updated_at,
          items: [product] // Store individual items for reference
        };
      } else {
        acc[key].count += 1;
        acc[key].items.push(product);
        // Keep the most recent update time
        if (new Date(product.updated_at) > new Date(acc[key].last_updated)) {
          acc[key].last_updated = product.updated_at;
        }
      }
      return acc;
    }, {});

    // Convert to array and add low stock detection
    const result = Object.values(productDetails).map(product => ({
      ...product,
      is_low_stock: product.count <= 5 // Low stock threshold
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get dalam proses products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get manufacturing process products'
    });
  }
});

// Get individual product records with full details
router.get('/detail', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { category, status, search } = req.query;

    let query = supabase
      .from('products')
      .select('id, qr_code, category, product_name, status, dalam_proses, created_at, updated_at')
      .eq('dalam_proses', false) // Exclude products in manufacturing process
      .order('updated_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`product_name.ilike.%${search}%,qr_code.ilike.%${search}%`);
    }

    const { data: products, error } = await query;

    if (error) {
      throw error;
    }

    // Group and count products by name for detail view
    const productDetails = products.reduce((acc, product) => {
      const key = `${product.category}-${product.product_name}`;
      if (!acc[key]) {
        acc[key] = {
          id: product.id,
          qr_code: product.qr_code,
          product_name: product.product_name,
          category: product.category,
          status: product.status,
          count: 1,
          last_updated: product.updated_at,
          items: [product] // Store individual items for reference
        };
      } else {
        acc[key].count += 1;
        acc[key].items.push(product);
        // Keep the most recent update time
        if (new Date(product.updated_at) > new Date(acc[key].last_updated)) {
          acc[key].last_updated = product.updated_at;
        }
      }
      return acc;
    }, {});

    // Convert to array and add low stock detection
    const result = Object.values(productDetails).map(product => ({
      ...product,
      is_low_stock: product.count <= 5 // Low stock threshold
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product details'
    });
  }
});

// Get products with optional filters (keep existing for backward compatibility)
router.get('/', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { category } = req.query;


    let query = supabase
      .from('products')
      .select('product_name')
      .neq('status', 'TERJUAL');

    if (category) {
      query = query.eq('category', category);
    }

    const { data: productData, error: productError } = await query;

    if (productError) {
      throw productError;
    }

    // Group products by name using JavaScript
    const productCounts = productData.reduce((acc, product) => {
      const productName = product.product_name;
      if (acc[productName]) {
        acc[productName]++;
      } else {
        acc[productName] = 1;
      }
      return acc;
    }, {});

    // Structure the data for the frontend
    const data = Object.entries(productCounts).map(([product_name, count]) => ({
      product_name: product_name,
      count: count
    }));

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products'
    });
  }
});

// Register a new product or create dalam-proses product
router.post('/', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { action, qr_code, category, product_name, status = 'TOKO', count = 1 } = req.body;

    if (action !== 'register' && action !== 'create-dalam-proses') {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    // Registration requires QR code, dalam-proses doesn't
    const isDalamProses = action === 'create-dalam-proses';

    if (!category || !product_name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // QR code is required for registration but not for dalam-proses
    if (!isDalamProses && !qr_code) {
      return res.status(400).json({
        success: false,
        message: 'QR code is required for registration'
      });
    }

    // Handle QR code validation for registration
    if (!isDalamProses) {
      console.log('Register product attempt:', { qr_code, category, product_name });

      // First validate that the QR code exists in qr_codes table
      const { data: qrCodeEntry, error: qrError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('qr_code', qr_code)
        .single();

      if (qrError && qrError.code === 'PGRST116') { // PGRST116 = not found
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code. This code was not generated in the system.'
        });
      }

      if (qrError) {
        throw qrError;
      }

      if (qrCodeEntry.is_used) {
        return res.status(409).json({
          success: false,
          message: 'This QR code has already been used to register a product.'
        });
      }

      // Check if product with this QR code already exists
      const { data: existingProduct, error: existingError } = await supabase
        .from('products')
        .select('id')
        .eq('qr_code', qr_code)
        .single();

      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: 'Product with this QR code already exists'
        });
      }
    } else {
      console.log('Create dalam-proses product attempt:', { category, product_name });
    }

    // Validate that the product name is from the predefined templates
    console.log('Template validation - Looking for:', { category, product_name });

    // First, let's see what templates exist for this category
    const { data: categoryTemplates, error: catError } = await supabase
      .from('product_templates')
      .select('category, product_name, is_active')
      .eq('category', category)
      .eq('is_active', true);

    console.log('Available templates for category:', categoryTemplates);

    const { data: template, error: templateError } = await supabase
      .from('product_templates')
      .select('id')
      .eq('category', category)
      .eq('product_name', product_name)
      .eq('is_active', true)
      .single();

    console.log('Template validation result:', { template, templateError });

    if (templateError || !template) {
      return res.status(400).json({
        success: false,
        message: `Invalid product name "${product_name}" for category "${category}". Please select from available templates. Available: ${categoryTemplates?.map(t => t.product_name).join(', ') || 'None'}`
      });
    }



    // Create products to insert - for dalam-proses, create multiple identical products based on count
    const productsToInsert = [];
    const productCount = isDalamProses ? Math.max(1, parseInt(count) || 1) : 1;

    for (let i = 0; i < productCount; i++) {
      productsToInsert.push({
        qr_code: isDalamProses ? null : qr_code, // QR code is null for dalam-proses
        category,
        product_name,
        status,
        dalam_proses: isDalamProses, // Set dalam_proses flag
        registered_by: req.session.userId,
        updated_by: req.session.userId
      });
    }

    // Insert the new products
    const { data, error } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select();

    if (error) {
      throw error;
    }

    // Mark the QR code as used in the qr_codes table (only for registration)
    if (!isDalamProses) {
      const { error: updateQrError } = await supabase
        .from('qr_codes')
        .update({
          is_used: true,
          used_by: req.session.userId,
          used_at: new Date().toISOString()
        })
        .eq('qr_code', qr_code);

      if (updateQrError) {
        console.error('Failed to mark QR code as used:', updateQrError);
        // Don't fail the whole operation, but log the error
      }
    }

    // Log the activity for each created product
    const activityLogs = data.map(product => ({
      user_id: req.session.userId,
      action: isDalamProses ? (productCount > 1 ? 'CREATE_DALAM_PROSES_PRODUCTS' : 'CREATE_DALAM_PROSES_PRODUCT') : 'REGISTER_PRODUCT',
      table_name: 'products',
      record_id: product.id,
      new_values: JSON.stringify(product),
      old_values: null,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    }));

    await supabase
      .from('activity_logs')
      .insert(activityLogs);

    res.json({
      success: true,
      message: isDalamProses
        ? (productCount > 1
            ? `${productCount} produk dalam proses produksi berhasil dibuat`
            : 'Product dalam proses produksi berhasil dibuat')
        : 'Product registered successfully',
      data
    });
  } catch (error) {
    console.error('Register product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register product'
    });
  }
});

// Update an existing product
router.put('/', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id, category, product_name, status, dalam_proses } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Get current product data for logging
    const { data: currentProduct, error: currentError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (currentError) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Prepare update data
    const updateData = {};
    if (category) updateData.category = category;
    if (product_name) updateData.product_name = product_name;
    if (status) updateData.status = status;
    if (dalam_proses !== undefined) updateData.dalam_proses = dalam_proses;
    updateData.updated_by = req.session.userId;
    updateData.updated_at = new Date().toISOString();

    // Update the product
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the activity
    await supabase
      .from('activity_logs')
      .insert([{
        user_id: req.session.userId,
        action: dalam_proses === false ? 'REGISTER_PRODUCT' : 'UPDATE_PRODUCT',
        table_name: 'products',
        record_id: id,
        old_values: JSON.stringify(currentProduct),
        new_values: JSON.stringify(updateData),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }]);

    res.json({
      success: true,
      message: dalam_proses === false ? 'Product registered successfully' : 'Product updated successfully',
      data
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product'
    });
  }
});

// Delete a product
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;

    // Get the product data for logging
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Log the activity
    await supabase
      .from('activity_logs')
      .insert([{
        user_id: req.session.userId,
        action: 'DELETE_PRODUCT',
        table_name: 'products',
        record_id: id,
        old_values: JSON.stringify(product),
        new_values: null,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }]);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete product'
    });
  }
});

module.exports = router;
