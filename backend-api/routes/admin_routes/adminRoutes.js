const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sql = require('mssql');
const router = express.Router();
const { verifyRole, authenticateToken } = require('../../middleware/authMiddleware');

module.exports = function (poolPromise) {

  // Retrieves all admin accounts from the database
  router.get('/', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM admin_login');
      res.json(result.recordset);
    } catch (err) {
      console.error('SQL error:', err.message);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });

  // Deletes a student and related records from the database
  router.delete('/students/:studentId', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    const { studentId } = req.params;
    const { password } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }

    let transaction;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
      const pool = await poolPromise;
      const result = await pool.request()
        .input('username', sql.VarChar, decoded.username)
        .query('SELECT password, role FROM admin_login WHERE username = @username');

      if (result.recordset.length === 0) {
        return res.status(401).json({ message: 'Admin not found' });
      }

      const admin = result.recordset[0];

      if (admin.role !== 'super-admin') {
        return res.status(403).json({ message: "Invalid role: Only super-admins can delete students." });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      transaction = await pool.transaction();
      await transaction.begin();

      await transaction.request()
        .input('studentId', sql.Int, studentId)
        .query('DELETE FROM login_info WHERE std_id = @studentId');

      await transaction.request()
        .input('studentId', sql.Int, studentId)
        .query('DELETE FROM test_student_tags WHERE std_id = @studentId');

      const resultDelete = await transaction.request()
        .input('studentId', sql.Int, studentId)
        .query('DELETE FROM test_students WHERE std_id = @studentId');

      await transaction.commit();

      if (resultDelete.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json({ message: 'Student and related records deleted successfully' });
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};