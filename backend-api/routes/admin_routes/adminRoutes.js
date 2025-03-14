const express = require('express');
const sql = require('mssql');
const router = express.Router();
const { verifyRole, authenticateToken } = require('../../middleware/authMiddleware');

module.exports = function (poolPromise) {
  /**
   * GET: Retrieves all admin accounts from the database
   * Only accessible by super-admins.
   */
  router.get('/', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT username, role FROM admin_login');
      res.json(result.recordset);
    } catch (err) {
      console.error('SQL error:', err.message);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });

  /**
   * DELETE: Removes an admin from the database
   * Only super-admins can perform this action.
   */
  router.delete('/:username', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    const { username } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required for deleting an admin' });
    }

    try {
      const pool = await poolPromise;

      // Fetch requesting admin's details
      const adminResult = await pool.request()
        .input('username', sql.VarChar, decoded.username)
        .query('SELECT password, role FROM admin_login WHERE username = @username');

      // Verify the password before deletion
      const isMatch = await bcrypt.compare(password, requestingAdmin.password);
      if (!isMatch) {
         return res.status(401).json({ message: 'Invalid password' });
      }

      // Perform admin deletion
       const deleteResult = await pool.request()
        .input('username', sql.VarChar, username)
        .query('DELETE FROM admin_login WHERE username = @username');

      if (deleteResult.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      res.json({ message: `Admin ${username} deleted successfully` });

    } catch (error) {
      console.error('SQL error:', error.message);
       res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  });

  /**
   * DELETE: Removes a student and related records from the database
   * Only accessible by super-admins.
   */
  router.delete('/students/:studentId', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    const { studentId } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required for deleting a student' });
    }

    let transaction;

    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('username', sql.VarChar, decoded.username)
        .query('SELECT password, role FROM admin_login WHERE username = @username');

      if (result.recordset.length === 0) {
        return res.status(401).json({ message: 'Admin not found' });
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

   /**
   * PUT: Updates an admin's details
   * Only super-admins can update admin accounts.
   */
  router.put('/admin/:username', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    const { username } = req.params;
    const { newUsername, role } = req.body;
  
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .input('newUsername', sql.VarChar, newUsername) 
        .input('role', sql.VarChar, role)
        .query('UPDATE admin_login SET username = @newUsername, role = @role WHERE username = @username');
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      res.json({ message: 'Admin updated successfully' });
    } catch (err) {
      console.error('SQL error:', err.message);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });

  /**
   * PUT: Updates student details
   * Only super-admins can update student records.
   */
  router.put('/student/:studentId', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    const { studentId } = req.params;
    const { preferred_name, expected_grad } = req.body;
  
    try {
      const pool = await poolPromise;
      const result = await pool.request()
      .input('studentId', sql.Int, studentId)
      .input('preferred_name', sql.VarChar, preferred_name)
      .input('expected_grad', sql.VarChar, expected_grad)
      .query(
        `UPDATE test_students 
         SET preferred_name = @preferred_name, 
             expected_grad = @expected_grad 
         WHERE std_id = @studentId`
      );
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      res.json({ message: 'Student updated successfully' });
    } catch (err) {
      console.error('SQL error:', err.message);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });

  /**
   * GET: Fetch all available tags
   * Only super-admins can access this route.
   */
  router.get('/tags', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    try {
      const pool = await poolPromise;
      // Assuming test_tags holds tag_id and tag_name
      const result = await pool.request().query('SELECT tag_id, tag_name FROM test_tags');
      res.json(result.recordset);
    } catch (err) {
      console.error('SQL error (fetching tags):', err.message);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });

  /**
   * GET: Fetch tags assigned to a specific student
   */
  router.get('/studentTags/:studentId', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    const { studentId } = req.params;
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('studentId', sql.Int, studentId)
        .query('SELECT tag_id FROM test_tag_service WHERE std_id = @studentId');
      res.json(result.recordset);
    } catch (err) {
      console.error('SQL error (fetching student tags):', err.message);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });

  /**
   * POST: Creates a new admin account
   * Only super-admins can perform this action.
   */
  router.post("/create", authenticateToken, verifyRole(["super-admin"]), async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const pool = await poolPromise;
      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.request()
        .input("username", sql.VarChar, username)
        .input("password", sql.VarChar, hashedPassword)
        .input("role", sql.VarChar, role)
        .query("INSERT INTO admin_login (username, password, role) VALUES (@username, @password, @role)");

      res.status(201).json({ message: "Admin created successfully" });
    } catch (error) {
      console.error("SQL error:", error.message);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  });

  router.put('/admin/deactivate/:username', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    const { username } = req.params;
    const { is_active } = req.body; 
  
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('is_active', sql.Bit, is_active)
            .query('UPDATE admin_login SET is_active = @is_active WHERE username = @username');
  
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
  
        res.json({ message: `Admin ${is_active ? 'activated' : 'deactivated'} successfully!` });
    } catch (err) {
        console.error('SQL error:', err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

  return router;
};