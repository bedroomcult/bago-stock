require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const qrRoutes = require('./routes/qr');
const scanRoutes = require('./routes/scan');
const templateRoutes = require('./routes/templates');
const bulkRoutes = require('./routes/bulk');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
const analyticsRoutes = require('./routes/analytics');

// Middleware
const corsOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];
if (process.env.NODE_ENV === 'production') {
  // Allow common tunneling domains and any origin for development
  corsOrigins.push('*');
  // You can add specific tunnel domains here if needed:
  // corsOrigins.push('https://your-tunnel-domain.trycloudflare.com');
}

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow all origins in production (tunneling scenarios)
    if (process.env.NODE_ENV === 'production') return callback(null, true);

    // Development: allow common localhost ports and Vite dev server
    if (corsOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Allow localhost with any port (common for dev servers)
    if (origin && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    if (origin && origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration (using cookie-session for production scalability)
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'your-session-secret-key'],
  maxAge: 12 * 60 * 60 * 1000, // 12 hours
  secure: false, // Set to true when using HTTPS
  httpOnly: true, // Prevent XSS attacks
  sameSite: 'lax' // CSRF protection for cross-site requests
}));

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running correctly'
  });
});

// Database login route
app.post('/api/auth', async (req, res) => {
  try {
    const { username, password, action } = req.body;
    const { getSupabaseClient } = require('./config/supabase');
    const supabase = getSupabaseClient();

    if (action === 'login') {
      // Query user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        console.log('User not found or inactive:', username);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password (keep as plain text to match database schema)
      if (user.password !== password) {
        console.log(`Login failed: Invalid password for user: ${username}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;
      req.session.fullName = user.full_name;
      req.session.lastActivity = Date.now();

      // Log login activity
      await supabase
        .from('activity_logs')
        .insert([{
          user_id: user.id,
          action: 'LOGIN',
          table_name: 'users',
          record_id: user.id,
          new_values: JSON.stringify({
            login_successful: true,
            last_login: new Date().toISOString()
          }),
          old_values: JSON.stringify({
            last_login: user.last_login
          }),
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }]);

      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.full_name
        }
      });
    } else if (action === 'logout') {
      // Clear session for cookie-session (no destroy method)
      req.session = null;
      res.json({
        success: true,
        message: 'Logout successful'
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
      message: 'Server error'
    });
  }
});

// Check auth status
app.get('/api/auth', (req, res) => {
  if (req.session.userId) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        username: req.session.username,
        role: req.session.role,
        fullName: req.session.fullName
      }
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve static files from the React app build directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Serving React app from Express server');
  }
});
