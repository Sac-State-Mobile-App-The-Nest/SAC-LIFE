const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // For password hashing
const sql = require('mssql'); // For database queries
const router = express.Router();

// Replace 'your_jwt_secret' with an environment variable in production
const JWT_SECRET = process.env.JWT_SECRET_ADMIN;

// Export a function that takes `poolPromise` as a parameter
module.exports = function (poolPromise) {
  router.post('/admin_login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Attempting admin login:', username);

    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .query('SELECT * FROM admin_login WHERE username = @username');

      if (result.recordset.length === 0) {
        console.log('Admin username not found');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = result.recordset[0];
      console.log('Admin user found:', user);

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        console.log('Invalid password');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate a JWT token for the admin
      const token = jwt.sign({ username: user.username, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};
