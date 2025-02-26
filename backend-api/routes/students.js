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

  // Get std_id, preferred_name, abd expected_grad
  router.get('/preferredInfo', async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT std_id, preferred_name, expected_grad FROM test_students');
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

  // Posting to test_student_tags and test_students table
  router.post('/profile-answers',authenticateToken, async (req, res) => {
    // gets the answers and student id of the user
    const { specificAnswers } = req.body;
    const studentId = req.user.std_id;
    // question 0 and 5 are not tags. it will be used for test_students | preferred_name, expected_grad
    // question 6 and 7 (inprogress)
    const { question0, question1, question2, question3, question4, question5, question6, question7} = specificAnswers;
    const allTags = [question1, question2, question3, question4, ...question6, ...question7]

    try {
      const pool = await poolPromise;
      const request = pool.request();

      if(allTags.length > 0){

        const tagPlaceholders = allTags.map((_, i) => `@tag${i}`).join(',');
        
        allTags.forEach((tag, i) => request.input(`tag${i}`, sql.VarChar, tag));
        
        const tagsQuery = `SELECT tag_id, tag_name FROM test_tags WHERE tag_name IN (${tagPlaceholders})`;
        const tags = await request.query(tagsQuery);
        
        const tagIds = tags.recordset.map(tag => tag.tag_id);
        
        if (tagIds.length > 0) {
          const values = tagIds.map(tagId => `(${studentId}, ${tagId})`).join(',');
          await pool.request().query(`INSERT INTO test_student_tags (std_id, tag_id) VALUES ${values}`);
        }
      }
        
      // question0 & question5 (test_students | preferred_name, expected_grad)
      await pool.request()
        .input('preferred_name', sql.VarChar, question0)
        .input('expected_grad', sql.VarChar, question5)
        .input('std_id', sql.Int, studentId)
        .query('UPDATE test_students SET preferred_name = @preferred_name, expected_grad = @expected_grad WHERE std_id = @std_id');

      // (login_info | first_login)
      await pool.request()
        .input('std_id', sql.Int, studentId)
        .query('UPDATE login_info SET first_login = 1 WHERE std_id = @std_id');

      res.status(200).json({ message: 'Profile creation made'});
    } catch (err) {
      console.error('SQL error:', err);
      res.status(500).send('Server Error');
    }

  });

  //Get the the student's college to display on profile page (ex: college of business, college of engineering & computer science)
  router.get('/studentAreaOfStudy', authenticateToken, async (req, res) => {
    try {
        const std_id = req.user.std_id; //data that was sent in from front end is std_id
        const pool = await poolPromise;
        const servicesList = await pool.request()
          .input('std_id', sql.Int, std_id)
          .query(`SELECT test_tags.tag_name FROM
                  test_tags JOIN test_student_tags ON
                  test_tags.tag_id = test_student_tags.tag_id WHERE
                  test_student_tags.std_id = @std_id AND
                  test_tags.tag_id BETWEEN 22 AND 28`); //22-28 is where the colleges are listed in test_tags table
        if (servicesList.recordset.length === 0){
            return res.status(404).json({ message: "Student does not have a college assigned to them" });
        }
        res.json(servicesList.recordset);
    } catch (err){
        console.error('SQL error', err);
        res.status(500).json({ message: 'Backend server error' });
    }
  });

  //get the user's year of study to display on profile(ex: freshman, sophomore, junior, senior, graduate)
  router.get('/studentYearOfStudy', authenticateToken, async (req, res) => {
    try {
        const std_id = req.user.std_id; //data that was sent in from front end is std_id
        const pool = await poolPromise;
        const servicesList = await pool.request()
          .input('std_id', sql.Int, std_id)
          .query(`SELECT test_tags.tag_name FROM
                  test_tags JOIN test_student_tags ON
                  test_tags.tag_id = test_student_tags.tag_id WHERE
                  test_student_tags.std_id = @std_id AND
                  test_tags.tag_id BETWEEN 1 AND 5`); //1-5 is where the year of duty are listed in test_tags table
        if (servicesList.recordset.length === 0){
            return res.status(404).json({ message: "Student does not have a year assigned to them" });
        }
        res.json(servicesList.recordset);
    } catch (err){
        console.error('SQL error', err);
        res.status(500).json({ message: 'Backend server error' });
    }
  });

  //update the student area of study (college of business -> college of engineering & computer science)
  router.put('/updateUserAreaOfStudy', authenticateToken, async (req, res) => {
    try{
      const std_id = req.user.std_id;
      const { areaOfStudy } = req.body //the college they attend at Sac State(College of Business)
      if(!areaOfStudy){
        return res.status(400).json({ messsage: "Area of study not found" })
      }
      const pool = await poolPromise;
      //get the tag_id from the tag name from the test_tags table
      const tagQuery = await pool.request()
        .input('areaOfStudy', sql.VarChar, areaOfStudy)
        .query('SELECT tag_id FROM test_tags WHERE tag_name = @areaOfStudy');
      if(tagQuery.recordset.length == 0) {
        return res.status(404).json({ message: "Area of study invalid" })
      }
      const tag_id = tagQuery.recordset[0].tag_id; //the tag_id retrieved
      //make sure the sql requests go in order
      const transaction = new sql.Transaction(pool);
      await transaction.begin();
      try{
        // Remove any existing area of study for the student (remove tags between 22 and 28) in test_student_tags table
        await transaction.request()
        .input('std_id', sql.Int, std_id)
        .query(`DELETE FROM test_student_tags WHERE std_id = @std_id AND tag_id BETWEEN 22 AND 28`);
  
        // Insert the new area of study in the test_student_tags table
        await transaction.request()
          .input('std_id', sql.Int, std_id)
          .input('tag_id', sql.Int, tag_id)
          .query(`INSERT INTO test_student_tags (std_id, tag_id) VALUES (@std_id, @tag_id)`);
  
        await transaction.commit();
        res.json({ success: true, message: 'Area of study updated successfully' });
      } catch (err) {
        await transaction.rollback(); //if query fails, revert any changes made
        throw err;
      }
    } catch (err) {
      console.error('SQL error', err);
      res.status(500).json({ message: 'Backend server error' });
    }
  });

  //Update the student year of study (freshman -> sophomore)
  router.put('/updateUserYearOfStudy', authenticateToken, async (req, res) => {
    try{
      const std_id = req.user.std_id;
      const { yearOfStudy } = req.body //the college they attend at Sac State(College of Business)
      if(!yearOfStudy){
        return res.status(400).json({ messsage: "year of study not found" })
      }
      const pool = await poolPromise;
      //get the tag_id from the tag name from the test_tags table
      const tagQuery = await pool.request()
        .input('yearOfStudy', sql.VarChar, yearOfStudy)
        .query('SELECT tag_id FROM test_tags WHERE tag_name = @yearOfStudy');
      if(tagQuery.recordset.length == 0) {
        return res.status(404).json({ message: "year of study invalid" })
      }
      const tag_id = tagQuery.recordset[0].tag_id; //the tag_id retrieved
      //make sure the sql requests go in order
      const transaction = new sql.Transaction(pool);
      await transaction.begin();
      try{
        // Remove any existing year of study for the student (remove tags between 1 and 5 - where (freshman, sopho... is located)) in test_student_tags table
        await transaction.request()
        .input('std_id', sql.Int, std_id)
        .query(`DELETE FROM test_student_tags WHERE std_id = @std_id AND tag_id BETWEEN 1 AND 5`);
  
        // Insert the new year of study in the test_student_tags table
        await transaction.request()
          .input('std_id', sql.Int, std_id)
          .input('tag_id', sql.Int, tag_id)
          .query(`INSERT INTO test_student_tags (std_id, tag_id) VALUES (@std_id, @tag_id)`);
  
        await transaction.commit();
        res.json({ success: true, message: 'year of study updated successfully' });
      } catch (err) {
        await transaction.rollback(); //if query fails, revert any changes made
        throw err;
      }
    } catch (err) {
      console.error('SQL error', err);
      res.status(500).json({ message: 'Backend server error' });
    }
  });

  // // DELETE a student by studentId
  // router.delete('/:studentId', async (req, res) => {
  //   const { studentId } = req.params;
  //   const { password } = req.body; // Get the password from the request body
  //   const token = req.headers.authorization?.split(' ')[1]; // Extract JWT token
  
  //   if (!token) {
  //     return res.status(401).json({ message: 'Authentication token is missing' });
  //   }
  
  //   let transaction; // Declare transaction variable here
  
  //   try {
  //     // Verify the JWT token
  //     const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
  
  //     // Fetch the admin's hashed password from the database
  //     const pool = await poolPromise;
  //     const result = await pool.request()
  //       .input('username', sql.VarChar, decoded.username)
  //       .query('SELECT password_hash FROM admin_login WHERE username = @username');
  
  //     if (result.recordset.length === 0) {
  //       return res.status(401).json({ message: 'Admin not found' });
  //     }
  
  //     const admin = result.recordset[0];
  
  //     // Compare the provided password with the stored hashed password
  //     const isMatch = await bcrypt.compare(password, admin.password_hash);
  //     if (!isMatch) {
  //       return res.status(401).json({ message: 'Invalid password' });
  //     }
  
  //     // Initialize and begin transaction
  //     transaction = pool.transaction();
  //     await transaction.begin();
  //     console.log("Transaction started");
  
  //     await transaction.request()
  //       .input('studentId', sql.Int, studentId)
  //       .query('DELETE FROM login_info WHERE std_id = @studentId');
  //     console.log("Deleted from login_info");
  
  //     await transaction.request()
  //       .input('studentId', sql.Int, studentId)
  //       .query('DELETE FROM test_student_tags WHERE std_id = @studentId');
  //     console.log("Deleted from test_student_tags");
  
  //     const resultDelete = await transaction.request()
  //       .input('studentId', sql.Int, studentId)
  //       .query('DELETE FROM test_students WHERE std_id = @studentId');
  //     console.log("Deleted from test_students");
  
  //     await transaction.commit();
  //     console.log("Transaction committed");
  
  //     if (resultDelete.rowsAffected[0] === 0) {
  //       return res.status(404).json({ message: 'Student not found' });
  //     }
  
  //     res.json({ message: 'Student and related records deleted successfully' });
  //   } catch (error) {
  //     console.error('Error during deletion:', error.message);
  
  //     // Rollback the transaction if initialized
  //     if (transaction) {
  //       try {
  //         await transaction.rollback();
  //         console.log("Transaction rolled back due to error");
  //       } catch (rollbackError) {
  //         console.error('Error during transaction rollback:', rollbackError.message);
  //       }
  //     }
  
  //     res.status(500).json({ message: 'Server error', error: error.message });
  //   }
  // });
  
return router;
};
