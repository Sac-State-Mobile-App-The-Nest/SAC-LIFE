const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // For password hashing
const sql = require('mssql'); // For database queries
const router = express.Router();
const { verifyRole, authenticateToken } = require('../../middleware/authMiddleware'); // Import valid roles


module.exports = function(poolPromise) {

  // DELETE a student by studentId
  router.delete('/students/:studentId', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    const { studentId } = req.params;
    const { password } = req.body; // Get the password from the request body
    const token = req.headers.authorization?.split(' ')[1]; // Extract JWT token
  
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }
  
    let transaction; // Declare transaction variable here
  
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
      console.log("🔹 Decoded Token in DELETE request:", decoded);  // Log this
  
      // Fetch the admin's hashed password from the database
      const pool = await poolPromise;
      const result = await pool.request()
        .input('username', sql.VarChar, decoded.username)
        .query('SELECT password, role FROM admin_login WHERE username = @username');
  
      if (result.recordset.length === 0) {
        return res.status(401).json({ message: 'Admin not found' });
      }
  
      const admin = result.recordset[0];

      console.log("🔹 Admin role from DB:", admin.role);
      console.log("🔹 Admin password from DB:", admin.password);
      console.log("🔹 Password sent by user:", password);

      // Check if the admin has the required role
      if (admin.role !== 'super-admin') {
        console.log("Invalid role detected! Access denied.");
        return res.status(403).json({ message: "Invalid role: Only super-admins can delete students." });
    }
  
      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // Initialize and begin transaction
      transaction = await pool.transaction();
      await transaction.begin();
      console.log("Transaction started");
  
      await transaction.request()
        .input('studentId', sql.Int, studentId)
        .query('DELETE FROM login_info WHERE std_id = @studentId');
      console.log("Deleted from login_info");
  
      await transaction.request()
        .input('studentId', sql.Int, studentId)
        .query('DELETE FROM test_student_tags WHERE std_id = @studentId');
      console.log("Deleted from test_student_tags");
  
      const resultDelete = await transaction.request()
        .input('studentId', sql.Int, studentId)
        .query('DELETE FROM test_students WHERE std_id = @studentId');
      console.log("Deleted from test_students");
  
      await transaction.commit();
      console.log("Transaction committed");
  
      if (resultDelete.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      res.json({ message: 'Student and related records deleted successfully' });
    } catch (error) {
      console.error('Error during deletion:', error.message);

  
      // Rollback the transaction if initialized
      if (transaction) {
        try {
          await transaction.rollback();
          console.log("Transaction rolled back due to error");
        } catch (rollbackError) {
          console.error('Error during transaction rollback:', rollbackError.message);
        }
      }
  
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  return router;

};