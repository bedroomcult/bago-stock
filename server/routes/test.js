const express = require('express');
const router = express.Router();

// Test endpoint to verify server is running
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running correctly'
  });
});

// Additional simple test for the auth endpoint
router.get('/auth/status', (req, res) => {
  res.json({
    status: 'Server running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;