const express = require('express');
const router = express.Router();
const sql = require('mssql');

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

module.exports = router;