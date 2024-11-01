const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get  ALL login_info table from SQL
router.get('/', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM login_info');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server Error');
    }
})

// router.get('/:studentId', async (req, res) => {
//     const { studentId } = req.params;

//     try {
//         const request = new sql.Request();

//         request.input('studentId', sql.Int, studentId);

//         const result = await request.query('SELECT * FROM login_info WHERE std_id = @studentId');
//         res.json(result.recordset);
//     } catch (err) {
//         console.error('SQL error', err);
//         res.status(500).send('Server Error');
//     }
// })

// const result = await request.query('SELECT * FROM login_info WHERE username = @username AND @hashed_pwd');


// TODO: Convert to POST request
// TODO: Send in a whole object or multiple parameters (user AND password), 

router.get('/login/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const request = new sql.Request();

        // TODO: Add new input for password
        request.input('username', sql.VarChar, username);

        // TODO: Verifying username, add in password verification logic
        const result = await request.query('SELECT * FROM login_info WHERE username = @username');

        // If username is empty -> Login failed
        if (result.recordset.length == 0) {
            res.send('Login failed.')
        } else {
            res.send('Login success.')
        }
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server Error');
    }
})

module.exports = router;