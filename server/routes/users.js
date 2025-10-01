const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getSupabaseClient } = require('../config/supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

// Get all users - Admin only
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { search, role, is_active, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      // Search in username or full_name (case-insensitive)
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: users, error } = await query;

    if (error) {
      throw error;
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      data: users,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users'
    });
  }
});

// Create new user - Admin only
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { username, password, role = 'staff', full_name, is_active = true } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Store password as plain text (no hashing)
    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        username,
        password: password,
        role,
        full_name,
        is_active,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the activity (exclude password from log)
    await supabase
      .from('activity_logs')
      .insert([{
        user_id: req.session.userId,
        action: 'CREATE_USER',
        table_name: 'users',
        record_id: newUser.id,
        new_values: JSON.stringify({
          username: newUser.username,
          role: newUser.role,
          full_name: newUser.full_name,
          is_active: newUser.is_active
        }),
        old_values: null,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }]);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.json({
      success: true,
      message: 'User created successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user'
    });
  }
});

// Update user - Admin only
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;
    const { username, password, role, full_name, is_active } = req.body;

    // Check if user exists and get current data
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== existingUser.username) {
      const { data: usernameCheck, error: usernameError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', id)
        .single();

      if (usernameCheck) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (username) updateData.username = username;
    if (password) {
      // Store password as plain text
      updateData.password = password;
    }
    if (role) updateData.role = role;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update user
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the activity (exclude password from log)
    const logData = { ...updateData };
    if (logData.password) {
      delete logData.password; // Don't log password
    }

    await supabase
      .from('activity_logs')
      .insert([{
        user_id: req.session.userId,
        action: 'UPDATE_USER',
        table_name: 'users',
        record_id: id,
        old_values: JSON.stringify({
          username: existingUser.username,
          role: existingUser.role,
          full_name: existingUser.full_name,
          is_active: existingUser.is_active
        }),
        new_values: JSON.stringify(logData),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }]);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user'
    });
  }
});

// Delete user - Admin only
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;

    // Check if user exists and get current data
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (id == req.session.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete by setting is_active to false
    const { data: deletedUser, error } = await supabase
      .from('users')
      .update({ is_active: false })
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
        action: 'DELETE_USER',
        table_name: 'users',
        record_id: id,
        old_values: JSON.stringify({
          username: existingUser.username,
          role: existingUser.role,
          full_name: existingUser.full_name,
          is_active: existingUser.is_active
        }),
        new_values: JSON.stringify({ is_active: false }),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user'
    });
  }
});

// Get own profile - Authenticated user
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const userId = req.session.userId;

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('username, full_name, role, last_login, created_at, is_active')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        username: userProfile.username,
        full_name: userProfile.full_name || '',
        role: userProfile.role,
        last_login: userProfile.last_login,
        created_at: userProfile.created_at,
        is_active: userProfile.is_active
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch profile'
    });
  }
});

// Update own profile - Authenticated user
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const userId = req.session.userId;
    const { full_name } = req.body;

    // Get current user data
    const { data: existingUser, error: getError } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (getError) {
      throw getError;
    }

    // Update user profile (only full_name for now)
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ full_name })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the activity
    await supabase
      .from('activity_logs')
      .insert([{
        user_id: userId,
        action: 'UPDATE_PROFILE',
        table_name: 'users',
        record_id: userId,
        old_values: JSON.stringify({ full_name: existingUser.full_name }),
        new_values: JSON.stringify({ full_name }),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }]);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        full_name: updatedUser.full_name
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
});

module.exports = router;
