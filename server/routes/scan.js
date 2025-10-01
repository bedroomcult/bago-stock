const express = require('express');
const router = express.Router();
const { getSupabaseClient } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// Handle QR code scanning
router.post('/', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { qr_code } = req.body;

    if (!qr_code) {
      return res.status(400).json({
        success: false,
        message: 'QR Code is required'
      });
    }

    // First check if this QR code exists in the qr_codes table
    const { data: qrCodeEntry, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('qr_code', qr_code)
      .single();

    if (qrError && qrError.code !== 'PGRST116') { // PGRST116 = not found
      throw qrError;
    }

    if (!qrCodeEntry) {
      // QR code doesn't exist in generated codes
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code. This code was not generated in the system.'
      });
    }

    // Check if this QR code has already been registered as a product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('qr_code', qr_code)
      .single();

    if (product) {
      // Product exists, return product info
      res.json({
        success: true,
        exists: true,
        product: product,
        qr_used: true
      });
    } else if (qrCodeEntry.is_used) {
      // QR code is marked as used but no product found - data inconsistency
      console.error('Data inconsistency: QR code marked as used but no product found', qr_code);
      return res.status(500).json({
        success: false,
        message: 'Data inconsistency detected. Please contact administrator.'
      });
    } else {
      // QR code exists but not used, return for registration
      res.json({
        success: true,
        exists: false,
        qr_code: qr_code,
        qr_used: false
      });
    }

    // Log the scan activity
    await supabase
      .from('activity_logs')
      .insert([{
        user_id: req.session.userId,
        action: 'SCAN_QR',
        table_name: 'qr_codes',
        new_values: JSON.stringify({ qr_code }),
        old_values: null,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }]);
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to scan QR code'
    });
  }
});

// Bulk status update
router.post('/bulk-update', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { uuids, status } = req.body;

    if (!uuids || !Array.isArray(uuids) || uuids.length === 0 || !status) {
      return res.status(400).json({
        success: false,
        message: 'UUIDs and status are required'
      });
    }

    // Update the status of the products
    const { data, error } = await supabase
      .from('products')
      .update({ status: status })
      .in('uuid', uuids)
      .select();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Bulk status update successful',
      data
    });
  } catch (error) {
    console.error('Bulk status update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update bulk status'
    });
  }
});

module.exports = router;
