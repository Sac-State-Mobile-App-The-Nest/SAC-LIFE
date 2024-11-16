// routes/students.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// Export a function that accepts the poolPromise
module.exports = function(poolPromise) {

  //Posting to test student tags table
  router.post('/profile', async (req, res) => {

  });
  
  // Get all students
  router.get('/', async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM test_students');
      res.json(result.recordset);
    } catch (err) {
      console.error('SQL error:', err.message);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });

  // Get a specific student by ID
  router.get('/:studentId', async (req, res) => {
    const { studentId } = req.params;
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('studentId', sql.Int, studentId)
        .query('SELECT * FROM test_students WHERE std_id = @studentId');

      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json(result.recordset[0]);
    } catch (err) {
      console.error('SQL error:', err);
      res.status(500).send('Server Error');
    }
  });

  // Login and return student's name
  router.post('/loginAndGetName', async (req, res) => {
    const { username, password } = req.body;
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .input('password', sql.VarChar, password)
        .query(`SELECT std_id FROM login_info WHERE username = @username AND hashed_pwd = @password`);

      if (result.recordset.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const std_id = result.recordset[0].std_id;
      const studentInfo = await pool.request()
        .input('std_id', sql.Int, std_id)
        .query(`SELECT f_name, m_name, l_name FROM test_students WHERE std_id = @std_id`);

      if (studentInfo.recordset.length === 0) {
        return res.status(404).json({ message: 'Student not found in database' });
      }

      const { f_name, m_name, l_name } = studentInfo.recordset[0];
      res.json({ f_name, m_name, l_name, std_id });
    } catch (err) {
      console.error('SQL error', err);
      res.status(500).json({ message: 'Backend server error' });
    }
  });

  router.delete('/cascade-delete/:studentId', async (req, res) => {
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
  
      // Fetch the admin's hashed password from the database
      const pool = await poolPromise;
      const result = await pool.request()
        .input('username', sql.VarChar, decoded.username)
        .query('SELECT password_hash FROM admin_login WHERE username = @username');
  
      if (result.recordset.length === 0) {
        return res.status(401).json({ message: 'Admin not found' });
      }
  
      const admin = result.recordset[0];
  
      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, admin.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // Initialize and begin transaction
      transaction = pool.transaction();
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
