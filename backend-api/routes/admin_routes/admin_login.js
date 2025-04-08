const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sql = require('mssql');
const router = express.Router();
const { VALID_ROLES } = require('../../middleware/adminAuthMiddleware');

const JWT_SECRET = process.env.JWT_SECRET_ADMIN;
const JWT_REFRESH_SECRET = process.env.JWT_SECRET_ADMIN_REFRESH;

module.exports = function (poolPromise) {
  // Admin login Post Route
  router.post('/admin_login', async (req, res) => {
    const { username, password } = req.body;

    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .query('SELECT username, password, role, is_active FROM admin_login WHERE username = @username');

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

      if (!user.is_active) {
        console.log('Account is deactivated');
        return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
      }

      if (!VALID_ROLES.includes(user.role)) {
        return res.status(400).json({ message: 'Invalid role detected in database. Contact support.' });
      }

      const accessToken = jwt.sign(
        { username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '15m' } // Short expiry for security
      );

      const refreshToken = jwt.sign(
        { username: user.username, role: user.role },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' } 
      );

      // 🔹 Store refresh token in the database
      await pool.request()
        .input('username', sql.VarChar, user.username)
        .input('refreshToken', sql.VarChar, refreshToken)
        .query('UPDATE admin_login SET refresh_token = @refreshToken WHERE username = @username');


        res.json({
          token: accessToken,  
          refreshToken: refreshToken,
          role: user.role
        });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/admin_refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token is required." });
    }

    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('refreshToken', sql.VarChar, refreshToken)
        .query('SELECT username, role, is_active FROM admin_login WHERE refresh_token = @refreshToken');

      if (result.recordset.length === 0) {
        return res.status(403).json({ message: "Invalid refresh token." });
      }

      const user = result.recordset[0];

      if (!user.is_active) {
        return res.status(403).json({ message: "Your account has been deactivated." });
      }

      // Verify refresh token
      jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err) => {
        if (err) {
          return res.status(403).json({ message: "Invalid refresh token." });
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
          { username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: '15m' }
        );

        res.json({ accessToken: newAccessToken });
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Logout (Invalidate refresh token)
  router.post('/admin_logout', async (req, res) => {
    const { refreshToken } = req.body;

    try {
      const pool = await poolPromise;

      // Remove refresh token from the database
      await pool.request()
        .input('refreshToken', sql.VarChar, refreshToken)
        .query('UPDATE admin_login SET refresh_token = NULL WHERE refresh_token = @refreshToken');

      res.json({ message: "Logged out successfully." });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};

