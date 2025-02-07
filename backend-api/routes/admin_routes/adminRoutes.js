const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const sql = require('mssql'); 
const router = express.Router();
const { verifyRole, authenticateToken } = require('../../middleware/authMiddleware'); 


module.exports = function(poolPromise) {

  // DELETE a student by studentId
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
      console.log("Decoded Token in DELETE request:", decoded);  // Log this
  
      
      const pool = await poolPromise;
      const result = await pool.request()
        .input('username', sql.VarChar, decoded.username)
        .query('SELECT password, role FROM admin_login WHERE username = @username');
  
      if (result.recordset.length === 0) {
        return res.status(401).json({ message: 'Admin not found' });
      }
  
      const admin = result.recordset[0];

      console.log("Admin role from DB:", admin.role);
      console.log("Admin password from DB:", admin.password);
      console.log("Password sent by user:", password);

      
      if (admin.role !== 'super-admin') {
        console.log("Invalid role detected! Access denied.");
        return res.status(403).json({ message: "Invalid role: Only super-admins can delete students." });
    }
  
      
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      
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

  // Update students info in test_students table
  router.patch('/students/:studentId', authenticateToken, verifyRole(['super-admin', 'content-manager', 'support-admin']), async (req, res) => {
    const { studentId } = req.params;
    const { f_name, m_name, l_name, email } = req.body; 

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('studentId', sql.Int, studentId)
            .input('f_name', sql.VarChar, f_name)
            .input('m_name', sql.VarChar, m_name)
            .input('l_name', sql.VarChar, l_name)
            .input('email', sql.VarChar, email)
            .query(`
                UPDATE test_students 
                SET f_name = @f_name, 
                    m_name = @m_name, 
                    l_name = @l_name, 
                    email = @email
                WHERE std_id = @studentId
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student updated successfully' });

    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

  return router;

};