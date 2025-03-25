const express = require('express');
const sql = require('mssql');
const router = express.Router();
const { verifyRole, authenticateToken } = require('../../middleware/authMiddleware');
const bcrypt = require('bcrypt');

module.exports = function (poolPromise) {

  /**
   * GET: Retrieves all admin accounts from the database
   * Only accessible by super-admins.
   */
  router.get('/', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT username, role, is_active FROM admin_login');
      res.json(result.recordset);
    } catch (err) {
      console.error('SQL error:', err.message);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });

  router.get('/audit-logs', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM admin_audit_log ORDER BY timestamp DESC');
      res.json(result.recordset);
    } catch (err) {
      console.error('SQL error (audit logs):', err.message);
      res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
  });

  /**
 * DELETE: Removes an admin from the database
 * Only super-admins can perform this action.
 */
  router.delete('/:username', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    const { username } = req.params;
    const { password } = req.body;
    const requestingAdmin = req.user.username;

    if (!password) {
      return res.status(400).json({ message: 'Password is required for deleting an admin' });
    }

    if (username === requestingAdmin) {
      return res.status(403).json({ message: "You can't delete yourself." });
    }

    try {
      const pool = await poolPromise;

      // Fetch the requesting admin's credentials
      const adminResult = await pool.request()
        .input('username', sql.VarChar, requestingAdmin)
        .query('SELECT password FROM admin_login WHERE username = @username');

      if (adminResult.recordset.length === 0) {
        return res.status(404).json({ message: 'Requesting admin not found' });
      }

      const hashedPassword = adminResult.recordset[0].password;
      const isMatch = await bcrypt.compare(password, hashedPassword);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      const deleteResult = await pool.request()
        .input('username', sql.VarChar, username)
        .query('DELETE FROM admin_login WHERE username = @username');

      if (deleteResult.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      // 🕵️ Log audit entry
      await pool.request()
        .input("actor_username", sql.VarChar, requestingAdmin)
        .input("action", sql.VarChar, 'delete_admin')
        .input("target_username", sql.VarChar, username)
        .query("INSERT INTO admin_audit_log (actor_username, action, target_username) VALUES (@actor_username, @action, @target_username)");

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
    const requestingAdmin = req.user.username;

    if (!password) {
      return res.status(400).json({ message: 'Password is required for deleting a student' });
    }

    let transaction;

    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('username', sql.VarChar,  requestingAdmin)
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

      await pool.request()
      .input("actor_username", sql.VarChar, requestingAdmin)
      .input("action", sql.VarChar, 'delete_student')
      .input("target_username", sql.VarChar, `student_id:${studentId}`)
      .query("INSERT INTO admin_audit_log (actor_username, action, target_username) VALUES (@actor_username, @action, @target_username)");


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

      await pool.request()
      .input("actor_username", sql.VarChar, req.user.username)
      .input("action", sql.VarChar, 'update_admin')
      .input("target_username", sql.VarChar, newUsername)
      .query("INSERT INTO admin_audit_log (actor_username, action, target_username) VALUES (@actor_username, @action, @target_username)");
  
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

      await pool.request()
      .input("actor_username", sql.VarChar, req.user.username)
      .input("action", sql.VarChar, 'update_student')
      .input("target_username", sql.VarChar, `student_id:${studentId}`)
      .query("INSERT INTO admin_audit_log (actor_username, action, target_username) VALUES (@actor_username, @action, @target_username)");

  
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
    const actor = req.user.username;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const pool = await poolPromise;

      // Check if username already exists
      const check = await pool.request()
        .input("username", sql.VarChar, username)
        .query("SELECT username FROM admin_login WHERE username = @username");

      if (check.recordset.length > 0) {
        return res.status(409).json({ message: "Admin with that username already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.request()
        .input("username", sql.VarChar, username)
        .input("password", sql.VarChar, hashedPassword)
        .input("role", sql.VarChar, role)
        .query("INSERT INTO admin_login (username, password, role) VALUES (@username, @password, @role)");

      // Insert audit log
      await pool.request()
        .input("actor_username", sql.VarChar, actor)
        .input("action", sql.VarChar, 'create_admin')
        .input("target_username", sql.VarChar, username)
        .query("INSERT INTO admin_audit_log (actor_username, action, target_username) VALUES (@actor_username, @action, @target_username)");

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

        await pool.request()
          .input("actor_username", sql.VarChar, req.user.username)
          .input("action", sql.VarChar, is_active ? 'activate_admin' : 'deactivate_admin')
          .input("target_username", sql.VarChar, username)
          .query("INSERT INTO admin_audit_log (actor_username, action, target_username) VALUES (@actor_username, @action, @target_username)");
  
        res.json({ message: `Admin ${is_active ? 'activated' : 'deactivated'} successfully!` });
    } catch (err) {
        console.error('SQL error:', err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });

  return router;
};