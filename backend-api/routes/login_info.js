const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Gets the whole login_info table from SQL
router.get('/', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM login_info');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server Error');
    }
})

// POST requests checks the username and password inputs with the database
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received Username:', username);
    console.log('Received Password:', password);

    try {
        const request = new sql.Request();

        request.input('username', sql.VarChar, username);
        request.input('password', sql.VarChar, password);

        // Checks if the username and password input match any fields in the database
        const result = await request.query('SELECT * FROM login_info WHERE username = @username AND hashed_pwd = @password');

        console.log('Query Result:', result.recordset);

        // If there are no matches, recordset.length will be 0
        if (result.recordset.length == 0) {
            res.send('Login failed.')
        } else {
            res.send('Login success.')
        }
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server Error.');
    }
})

module.exports = router;


// Navigate to the 'backend-api' folder and then run:
// npm install bcryptjs jsonwebtoken