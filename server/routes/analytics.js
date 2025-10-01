const express = require('express');
const router = express.Router();
const { getSupabaseClient } = require('../config/supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

// Get activity logs - Admin only
router.get('/activity-logs', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const {
      user,        // filter by username
      action,      // filter by action type
      date_from,   // filter from date
      date_to,     // filter to date
      limit = 100, // pagination limit
      offset = 0   // pagination offset
    } = req.query;

    let query = supabase
      .from('activity_logs')
      .select(`
        id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent,
        created_at,
        users:user_id (
          id,
          username,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (user) {
      query = query.eq('users.username', user);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (date_from || date_to) {
      if (date_from) {
        query = query.gte('created_at', date_from + ' 00:00:00');
      }
      if (date_to) {
        query = query.lte('created_at', date_to + ' 23:59:59');
      }
    }

    const { data: logs, error } = await query;

    if (error) {
      throw error;
    }

    // Transform logs to match frontend expectations
    const transformedLogs = logs.map(log => ({
      id: log.id,
      user: log.users?.username || 'Unknown',
      user_full_name: log.users?.full_name || 'Unknown',
      action: log.action,
      timestamp: log.created_at,
      details: generateLogDetails(log),
      table_name: log.table_name,
      record_id: log.record_id,
      old_values: log.old_values,
      new_values: log.new_values
    }));

    // Get total count for pagination
    const { count } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      data: transformedLogs,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Activity logs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch activity logs'
    });
  }
});

// Helper function to generate human-readable log details
function generateLogDetails(log) {
  const action = log.action;

  let details = '';

  switch(action) {
    case 'LOGIN':
      details = 'User logged in';
      break;

    case 'REGISTER_PRODUCT':
      if (log.new_values) {
        const newVals = typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values;
        details = `Added new product: ${newVals.product_name || 'Unknown product'}`;
      } else {
        details = 'Registered a new product';
      }
      break;

    case 'UPDATE_PRODUCT':
      if (log.new_values && log.old_values) {
        const newVals = typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values;
        const oldVals = typeof log.old_values === 'string' ? JSON.parse(log.old_values) : log.old_values;

        const changes = [];
        if (newVals.status && oldVals.status && newVals.status !== oldVals.status) {
          changes.push(`${oldVals.status} → ${newVals.status}`);
        }
        if (newVals.category && oldVals.category && newVals.category !== oldVals.category) {
          changes.push(`Category: ${oldVals.category} → ${newVals.category}`);
        }

        details = changes.length > 0
          ? `Updated product ${changes.join(', ')}`
          : `Updated product: ${newVals.product_name || 'Unknown'}`;
      } else {
        details = `Updated product ${log.record_id || ''}`;
      }
      break;

    case 'DELETE_PRODUCT':
      if (log.old_values) {
        const oldVals = typeof log.old_values === 'string' ? JSON.parse(log.old_values) : log.old_values;
        details = `Deleted product: ${oldVals.product_name || 'Unknown product'}`;
      } else {
        details = `Deleted product ${log.record_id || ''}`;
      }
      break;

    case 'CREATE_TEMPLATE':
      if (log.new_values) {
        const newVals = typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values;
        details = `Created template: ${newVals.category || ''} - ${newVals.product_name || ''}`;
      } else {
        details = `Created new product template`;
      }
      break;

    case 'UPDATE_TEMPLATE':
      if (log.new_values) {
        const newVals = typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values;
        details = `Updated template: ${newVals.product_name || 'Unknown'}`;
      } else {
        details = `Updated product template`;
      }
      break;

    case 'DELETE_TEMPLATE':
      details = 'Deleted product template';
      break;

    case 'GENERATE_QR_CODES':
      if (log.new_values) {
        const newVals = typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values;
        details = `Generated ${newVals.count || 0} QR codes`;
      } else {
        details = 'Generated QR codes';
      }
      break;

    case 'CREATE_USER':
      if (log.new_values) {
        const newVals = typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values;
        details = `Created user: ${newVals.username || 'Unknown'}`;
      } else {
        details = `Created new user account`;
      }
      break;

    case 'UPDATE_USER':
      if (log.new_values) {
        const newVals = typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values;
        details = `Updated user: ${newVals.username || 'Unknown'}`;
      } else {
        details = `Updated user account`;
      }
      break;

    case 'DELETE_USER':
      if (log.old_values) {
        const oldVals = typeof log.old_values === 'string' ? JSON.parse(log.old_values) : log.old_values;
        details = `Deleted user: ${oldVals.username || 'Unknown'}`;
      } else {
        details = `Deleted user account`;
      }
      break;

    default:
      details = `${action} operation`;
  }

  return details;
}

// Get recent activities for dashboard - Filter by user role
router.get('/dashboard/activities', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const limit = parseInt(req.query.limit) || 10; // Default to 10 recent activities

    let query = supabase
      .from('activity_logs')
      .select(`
        id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        created_at,
        users:user_id (
          id,
          username,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter activities based on user role
    // - Admin: see all activities
    // - Staff: see only their own activities
    if (req.session.role !== 'admin') {
      query = query.eq('user_id', req.session.userId);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw error;
    }

    // Transform logs to match dashboard expectations
    const transformedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      user: log.users?.username || 'Unknown',
      timestamp: log.created_at,
      details: generateLogDetails(log)
    }));

    res.json({
      success: true,
      data: transformedLogs
    });
  } catch (error) {
    console.error('Dashboard activities error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get recent activities'
    });
  }
});

// Analytics dashboard route - Admin only
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    // Could add more analytics data here in the future
    res.json({
      success: true,
      message: 'Analytics dashboard route accessed successfully'
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to access analytics dashboard route'
    });
  }
});

module.exports = router;
