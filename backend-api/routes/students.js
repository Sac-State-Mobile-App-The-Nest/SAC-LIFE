const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config'); //server config file

// Get test_students table from SQL
router.get('/', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM test_students');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server Error');
    }
})

// Get test_students table from SQL
router.get('/:studentId', async (req, res) => {
    const { studentId } = req.params;
    console.log(studentId);
    try {
        const request = new sql.Request();

        request.input('studentId', sql.Int, studentId);

        const result = await request.query('SELECT * FROM test_students WHERE std_id = @studentId');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server Error');
    }
})


//send in login info from frontend and then return user's first, middle, and last name
//uses post since data is more sensitive
router.post('/loginAndGetName', async (req, res) => {
    const { username, password } = req.body; //data that is sent in from front end is username and password
    try{
        const pool = await sql.connect(config);
        //check username and password if in database
        // Using a parameterized query
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query(`
                SELECT std_id FROM login_info WHERE username = @username AND hashed_pwd = @password
            `);

        if (result.recordset.length === 0){
            return res.status(401).json({ message: 'Invalid user login/password credentials' });
        }
        // console.log(result)
        //if username and password exists in database, get the std_id (primary key and use it to query for user's first, middle, and last name)
        const std_id = result.recordset[0].std_id;
        const studentInfo = await pool.request()
            .input('std_id', sql.Int, std_id)
            .query(`
                SELECT f_name, m_name, l_name FROM test_students WHERE std_id = @std_id
            `);

        //check if student was in test_students table
        if (studentInfo.recordset.length === 0){
            return res.status(404).json({ message: 'Student not found in database' });
        }

        //if username/password in database and student was found with information
        const { f_name, m_name, l_name } = studentInfo.recordset[0] //destructures data retrieved into 3 variables

        //send user information to front end
        res.json({f_name, m_name, l_name, std_id});
    } catch (err){
        console.error('SQL error', err);
        res.status(500).json({ message: 'Backend server error' });
    } finally {
        // Close the database connection
        await sql.close();
    }
});
module.exports = router;