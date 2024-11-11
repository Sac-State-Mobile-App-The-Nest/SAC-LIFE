// routes/students.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');

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
    const pool = await poolPromise;

    try {
        console.log("Attempting to delete student:", studentId);

        // Use a single transaction request object
        const transaction = pool.transaction();
        
        // Start the transaction
        await transaction.begin();
        console.log("Transaction started");

        // Delete from related tables first
        await transaction.request()
            .input('studentId', sql.Int, studentId)
            .query('DELETE FROM login_info WHERE std_id = @studentId');
        console.log("Deleted from login_info");

        await transaction.request()
            .input('studentId', sql.Int, studentId)
            .query('DELETE FROM test_student_tags WHERE std_id = @studentId');
        console.log("Deleted from test_student_tags");

        // Delete from the main table
        const result = await transaction.request()
            .input('studentId', sql.Int, studentId)
            .query('DELETE FROM test_students WHERE std_id = @studentId');
        console.log("Deleted from test_students");

        // Commit the transaction if all deletions were successful
        await transaction.commit();
        console.log("Transaction committed");

        if (result.rowsAffected[0] === 0) {
            console.log(`Student with std_id ${studentId} not found`);
            res.status(404).json({ message: 'Student not found' });
        } else {
            console.log("Deleted student and related records successfully");
            res.json({ message: 'Student and related records deleted successfully' });
        }
    } catch (error) {
        console.error('SQL error during delete operation:', error.message);

        // Rollback the transaction in case of an error
        try {
            await transaction.rollback();
            console.log("Transaction rolled back due to error");
        } catch (rollbackError) {
            console.error('Error during transaction rollback:', rollbackError.message);
        }

        res.status(500).json({ message: 'Server error deleting student and related records', error: error.message });
    }
});

  
  
return router;
};
