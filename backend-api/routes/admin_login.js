// routes/admin_login.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Replace with actual admin credentials validation
const adminUser = { username: 'admin', password: 'admin123' };

router.post('/admin_login', (req, res) => {
  const { username, password } = req.body;
  
  // Validate admin credentials
  if (username === adminUser.username && password === adminUser.password) {
    // Generate JWT token for admin access
    const token = jwt.sign({ username, role: 'admin' }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
});

module.exports = router;