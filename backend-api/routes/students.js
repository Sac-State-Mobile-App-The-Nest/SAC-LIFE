// routes/students.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Export a function that accepts the poolPromise
module.exports = function(poolPromise) {
  
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

  // DELETE a student by studentId
  router.delete('/:studentId', async (req, res) => {
    const { studentId } = req.params;
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('studentId', sql.Int, studentId)
        .query('DELETE FROM test_students WHERE std_id = @studentId');

      if (result.rowsAffected[0] === 0) {
        res.status(404).json({ message: 'Student not found' });
      } else {
        res.json({ message: 'Student deleted successfully' });
      }
    } catch (error) {
      console.error('SQL error', error);
      res.status(500).json({ message: 'Server error deleting student' });
    }
  });

  return router;
};
