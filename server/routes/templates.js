const express = require('express');
const router = express.Router();
const { getSupabaseClient } = require('../config/supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

// Get product templates (all templates for admin, or filtered for regular users)
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('product_templates')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data,
      total: data.length
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get templates'
    });
  }
});

// Get product templates with no registered products (empty stock)
router.get('/empty-stock', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    // Query to find templates with no corresponding products
    const { data, error } = await supabase
      .from('product_templates')
      .select(`
        id,
        category,
        product_name,
        color,
        is_active,
        created_at
      `)
      .order('category', { ascending: true })
      .order('product_name', { ascending: true });

    if (error) {
      throw error;
    }

    // For each template, check if there are any products with the same category and product_name
    const emptyStockTemplates = [];
    for (const template of data) {
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('category', template.category)
        .eq('product_name', template.product_name)
        .limit(1);

      if (productError) {
        throw productError;
      }

      // If no products found for this template, it's an empty stock template
      if (!products || products.length === 0) {
        emptyStockTemplates.push(template);
      }
    }

    res.json({
      success: true,
      data: emptyStockTemplates,
      total: emptyStockTemplates.length
    });
  } catch (error) {
    console.error('Get empty stock templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get empty stock templates'
    });
  }
});

const requireAuthOptional = (req, res, next) => {
  // Allow unauthenticated requests for now to enable category-based fetching
  // In production, you might want to enable this: return requireAuth(req, res, next);
  next();
};

// Get product templates by category (for regular users during product registration)
router.get('/by-category', requireAuthOptional, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    // For development/testing, if Supabase is not configured properly,
    // return mock data based on the database_schema.sql
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      let mockTemplates = [];
      const templateData = {
        'Sofa': ['Sofa 2 Seater', 'Sofa 3 Seater', 'Sofa Sudut', 'Sofa L'],
        'Kursi': ['Kursi Makan', 'Kursi Kantor'],
        'Meja': ['Meja Makan', 'Meja Belajar'],
        'Sungkai': ['Sungkai Panjang', 'Sungkai Pendek'],
        'Nakas': ['Nakas Minimalis', 'Nakas Sudut'],
        'Buffet': ['Buffet TV', 'Buffet Minimalis']
      };

      if (templateData[category]) {
        mockTemplates = templateData[category].map(product_name => ({
          category,
          product_name
        }));
      }

      return res.json({
        success: true,
        data: mockTemplates
      });
    }

    const { data, error } = await supabase
      .from('product_templates')
      .select('category, product_name, color')
      .eq('category', category)
      .eq('is_active', true)
      .order('product_name', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Get templates by category error:', error);

    // Fallback mock data if there's a connection error
    const fallbackData = {
      'Sofa': ['Sofa 2 Seater', 'Sofa 3 Seater', 'Sofa Sudut', 'Sofa L'],
      'Kursi': ['Kursi Makan', 'Kursi Kantor'],
      'Meja': ['Meja Makan', 'Meja Belajar'],
      'Sungkai': ['Sungkai Panjang', 'Sungkai Pendek'],
      'Nakas': ['Nakas Minimalis', 'Nakas Sudut'],
      'Buffet': ['Buffet TV', 'Buffet Minimalis']
    };

    const { category } = req.query;
    let mockTemplates = [];

    if (category && fallbackData[category]) {
      mockTemplates = fallbackData[category].map(product_name => ({
        category,
        product_name
      }));
    }

    res.json({
      success: true,
      data: mockTemplates
    });
  }
});

// Create a new product template
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { category, product_name, color = '#3B82F6', is_active = true } = req.body;

    if (!category || !product_name) {
      return res.status(400).json({
        success: false,
        message: 'Category and product name are required'
      });
    }

    // Check if template already exists
    const { data: existing, error: existingError } = await supabase
      .from('product_templates')
      .select('id')
      .eq('category', category)
      .eq('product_name', product_name)
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Template already exists'
      });
    }

    const { data, error } = await supabase
      .from('product_templates')
      .insert([{
        category,
        product_name,
        color,
        is_active,
        created_by: req.session.userId
      }])
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
        action: 'CREATE_TEMPLATE',
        table_name: 'product_templates',
        record_id: data.id,
        new_values: JSON.stringify(data),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }]);

    res.json({
      success: true,
      message: 'Template created successfully',
      data
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create template'
    });
  }
});

// Update an existing product template
router.put('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id, category, product_name, is_active } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required'
      });
    }

    // Get current template data for logging
    const { data: currentTemplate, error: currentError } = await supabase
      .from('product_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (currentError) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Prepare update data
    const updateData = {};
    if (category) updateData.category = category;
    if (product_name) updateData.product_name = product_name;
    if (req.body.color !== undefined) updateData.color = req.body.color;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('product_templates')
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
        action: 'UPDATE_TEMPLATE',
        table_name: 'product_templates',
        record_id: id,
        old_values: JSON.stringify(currentTemplate),
        new_values: JSON.stringify(data),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }]);

    res.json({
      success: true,
      message: 'Template updated successfully',
      data
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update template'
    });
  }
});

// Delete a product template
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;

    // Check if template exists
    const { data: template, error: templateError } = await supabase
      .from('product_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (templateError) {
      console.error('Error finding template:', templateError);
      return res.status(404).json({
        success: false,
        message: 'Template not found: ' + templateError.message
      });
    }

    // Check if any products are using this template
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('category', template.category)
      .eq('product_name', template.product_name);

    console.log('Products using template:', products);


    if (productsError) {
      console.error('Error checking for associated products:', productsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete template: ' + productsError.message
      });
    }

    console.log('Number of products using template:', products.length);


    if (products && products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete template. ' + products.length + ' products are still using it. Please delete those products first.'
      });
    }

    const { error } = await supabase
      .from('product_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete template error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete template: ' + error.message
      });
    }

    // Log the activity
    await supabase
      .from('activity_logs')
      .insert([{
        user_id: req.session.userId,
        action: 'DELETE_TEMPLATE',
        table_name: 'product_templates',
        record_id: id,
        old_values: JSON.stringify(template),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }]);

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete template'
    });
  }
});

module.exports = router;
