// routes/students.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');

const { authenticateToken } = require('../authMiddleware');

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
  router.get('/student/:studentId', async (req, res) => {
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

  // return student's name
  router.get('/getName', authenticateToken, async (req, res) => {
    const std_id = req.user.std_id
    try {
      const pool = await poolPromise;
      const studentInfo = await pool.request()
        .input('std_id', sql.Int, std_id)
        .query(`SELECT f_name, m_name, l_name FROM test_students WHERE std_id = @std_id`);

      if (studentInfo.recordset.length === 0) {
        return res.status(404).json({ message: 'Student not found in database' });
      }

      const { f_name, m_name, l_name } = studentInfo.recordset[0];
      res.json({ f_name, m_name, l_name });
    } catch (err) {
      console.error('SQL error', err);
      res.status(500).json({ message: 'Backend server error' });
    }
  });

  //Posting to test student tags table
  router.post('/profile-answers',authenticateToken, async (req, res) => {
    const { specificAnswers } = req.body;
    // replace with req.studentId
    const studentId = req.user.std_id;

    const { question1, question2, question3 } = specificAnswers;

    try {
      const pool = await poolPromise;

      tags = await pool.request()
        .input('tagName1', sql.VarChar, question1)
        .input('tagName2', sql.VarChar, question2)
        .input('tagName3', sql.VarChar, question3)
        .query('SELECT tag_id, tag_name FROM test_tags WHERE tag_name IN (@tagName1, @tagName2, @tagName3)');

      const tagMap = tags.recordset.reduce((acc, tag) => {
        acc[tag.tag_name] = tag.tag_id;
        return acc;
      }, {});

      // Insert users
      await pool.request()
        .input('std_id', sql.Int, studentId)
        .input('tagId1', sql.Int, tagMap[question1])
        .query('INSERT INTO test_student_tags (std_id, tag_id) VALUES (@std_id, @tagId1)');

      await pool.request()
        .input('std_id', sql.Int, studentId)
        .input('tagId2', sql.Int, tagMap[question2])
        .query('INSERT INTO test_student_tags (std_id, tag_id) VALUES (@std_id, @tagId2)');

      await pool.request()
        .input('std_id', sql.Int, studentId)
        .input('tagId3', sql.Int, tagMap[question3])
        .query('INSERT INTO test_student_tags (std_id, tag_id) VALUES (@std_id, @tagId3)');
      
      await pool.request()
        .input('std_id', sql.Int, studentId)
        .query('UPDATE login_info SET first_login = 1 WHERE std_id = @std_id');

      res.status(200).json({ message: 'Profile creation made'});
    } catch (err) {
      console.error('SQL error:', err);
      res.status(500).send('Server Error');
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
