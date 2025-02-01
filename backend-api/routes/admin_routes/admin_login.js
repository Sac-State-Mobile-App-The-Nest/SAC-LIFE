const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // For password hashing
const sql = require('mssql'); // For database queries
const router = express.Router();
const { VALID_ROLES } = require('../../middleware/authMiddleware'); // Import valid roles

// Replace 'your_jwt_secret' with an environment variable in production
const JWT_SECRET = process.env.JWT_SECRET_ADMIN;

// Export a function that takes `poolPromise` as a parameter
module.exports = function (poolPromise) {

  // Admin login Post Route
  router.post('/admin_login', async (req, res) => {
    const { username, password } = req.body;

    console.log('Attempting admin login:', username);


    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .query('SELECT username, password, role FROM admin_login WHERE username = @username');

      if (result.recordset.length === 0) {
        console.log('Admin username not found');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = result.recordset[0];
      console.log('Admin user found:', user);

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('Invalid password');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('User role:', user.role);

      // Validate role from database before issuing token
      if (!VALID_ROLES.includes(user.role)) {
        return res.status(400).json({ message: 'Invalid role detected in database. Contact support.' });
      }
      
      console.log("🔹 User object before token creation:", user);

      // Generate a JWT token for the admin
      const token = jwt.sign(
        { username: user.username, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '1h' });

      res.json({ token });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};
