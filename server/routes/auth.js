const express = require('express');
const router = express.Router();
const { getSupabaseClient } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// Login route
router.post('/', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { username, password } = req.body;
    const action = req.body.action;

    if (action === 'login') {
     console.log('Login attempt:', { username, password });
      // Query the users table
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Login query error:', error);
        console.log('Supabase query result:', { users, error });
        return res.status(401).json({
          success: false,
          message: 'Login failed - user not found'
        });
      }

      // For demo purposes, using plain text comparison
      // In production, passwords should be hashed
      if (users && users.password === password.trim()) {
        // Set session
        req.session.userId = users.id;
        req.session.username = users.username;
        req.session.role = users.role;
        req.session.fullName = users.full_name || users.username;
        req.session.lastActivity = Date.now();

        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', users.id);

        return res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: users.id,
            username: users.username,
            role: users.role,
            fullName: users.full_name || users.username,
            last_login: new Date().toISOString()
          }
        });
      } else {
        console.log('Login failed - Invalid credentials');
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }
    }  else if (action === 'logout') {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Logout failed'
          });
        }
        res.json({
          success: true,
          message: 'Logout successful'
        });
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// Check authentication status
router.get('/', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data: userData, error } = await supabase
      .from('users')
      .select('last_login')
      .eq('id', req.session.userId)
      .single();

    if (error) {
      console.error('Error fetching user last_login:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch user data' });
    }

    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        username: req.session.username,
        role: req.session.role,
        fullName: req.session.fullName,
        last_login: userData.last_login
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
