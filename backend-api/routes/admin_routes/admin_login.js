const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sql = require('mssql');
const router = express.Router();
const { VALID_ROLES } = require('../../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET_ADMIN;

module.exports = function (poolPromise) {

  // Admin login Post Route
  router.post('/admin_login', async (req, res) => {
    const { username, password } = req.body;

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
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log('Invalid password');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!VALID_ROLES.includes(user.role)) {
        return res.status(400).json({ message: 'Invalid role detected in database. Contact support.' });
      }

      const token = jwt.sign(
        { username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token, role: user.role });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};

