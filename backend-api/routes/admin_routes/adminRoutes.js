const express = require('express');
const sql = require('mssql');
const router = express.Router();
const { verifyRole, authenticateToken } = require('../../middleware/adminAuthMiddleware');
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

   /**
   * GET: Retrieves all audit logs of admins
   * Only accessible by super-admins.
   */
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

      const hashedPassword = result.recordset[0].password;
      const isMatch = await bcrypt.compare(password, hashedPassword);
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
   * Only super-admins, support-admins, and content-managers can update student records.
   */
  router.put('/student/:studentId', authenticateToken, verifyRole(['super-admin', 'content-manager', 'support-admin']), async (req, res) => {
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

  /**
 * PUT: deactivates or activates a admin
 * Only super-admins can perform this action.
 */
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

  /**
 * GET: Returns all chatbot logs
 * Only accessible by super-admins
 */
  router.get('/chatbot-logs', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
          l.id,                        
          l.std_id,
          s.username,
          l.student_question,
          l.bot_response,
          l.timestamp
        FROM chat_logs l
        JOIN login_info s ON l.std_id = s.std_id
        ORDER BY l.timestamp DESC
      `);
      res.json(result.recordset);
    } catch (err) {
      console.error('SQL error (chatbot logs):', err.message);
      res.status(500).json({ message: 'Failed to fetch chatbot logs' });
    }
  });
  


router.delete('/chatbot-logs/:id', authenticateToken, verifyRole(['super-admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM chat_logs WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Chat log not found' });
    }

    res.json({ message: 'Chat log deleted successfully' });
  } catch (err) {
    console.error('SQL error (delete chat log):', err.message);
    res.status(500).json({ message: 'Failed to delete chat log' });
  }
});
  
    /**
 * get: gets logs of all login dates within the past month, week, and day
 * All admins can see analytics.
 */
  router.get('/admin/analytics/numberOfLogins', authenticateToken, verifyRole(['super-admin', 'content-manager', 'support-admin', 'read-only']), async (req, res) => {
    //gets all login dates from login_logs tables and is sorted by most recent dates within the past month
    try {
      const pool = await poolPromise;
      //get the number of logins for today grouped by hour
      const todayResult = await pool.request().query(`
        SELECT DATEPART(HOUR, login_date) AS hour, COUNT(*) AS count FROM login_logs
        WHERE CAST(login_date AS DATE) = CAST(GETDATE() AS DATE) GROUP BY DATEPART(HOUR, login_date) ORDER BY hour`);
      //get number of logins for the past week grouped by day
      const weekResult = await pool.request().query(`
        SELECT CAST(login_date AS DATE) AS date, COUNT(*) AS count
        FROM login_logs
        WHERE login_date >= DATEADD(DAY, -6, CAST(GETDATE() AS DATE))  -- Last 7 days from today
        GROUP BY CAST(login_date AS DATE)
        ORDER BY CAST(login_date AS DATE)`);
      //get number of logins for past month grouped by day
      const monthResult = await pool.request().query(`
        SELECT CAST(login_date AS DATE) AS date, COUNT(*) AS count
        FROM login_logs
        WHERE login_date >= DATEADD(DAY, -29, CAST(GETDATE() AS DATE))  -- Last 30 days
        GROUP BY CAST(login_date AS DATE)
        ORDER BY CAST(login_date AS DATE)`);
      res.json({
        today: {
          hourly: todayResult.recordset, //[{ hour: 0, count: 2 }, { hour: 1, count: 5}...]
        },
        week: {
          daily: weekResult.recordset,   //[{ date: '2025-04-13', count: 10 }, { date: '2025-04-14', count: 7 }...]
        },
        month: {
          daily: monthResult.recordset,  //[{ date: '2025-03-15', count: 20 }, { date: '2025-04-10', count: 10 }...]
        },
      });
    } catch (err) {
        console.error('SQL error:', err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });

  /**
 * get: gets the number of total active accounts
 * All admins can see analytics.
 */
  router.get('/admin/analytics/numberOfActiveAccounts', authenticateToken, verifyRole(['super-admin', 'content-manager', 'support-admin', 'read-only']), async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT COUNT(*) AS activeCount FROM login_info WHERE is_active = 1');
      const activeCount = result.recordset[0].activeCount;
      res.json({ activeUsers: activeCount });
    } catch (err) {
        console.error('Error fecthing number of active accounts', err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });

  /**
   * get: gets the number of total deactivated accounts
   * All admins can see analytics.
   */
  router.get('/admin/analytics/numberOfInactiveAccounts', authenticateToken, verifyRole(['super-admin', 'content-manager', 'support-admin', 'read-only']), async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT COUNT(*) AS activeCount FROM login_info WHERE is_active = 0');
      const activeCount = result.recordset[0].activeCount;
      res.json({ inactiveUsers: activeCount });
    } catch (err) {
        console.error('Error fecthing number of active accounts', err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });

  return router;
};