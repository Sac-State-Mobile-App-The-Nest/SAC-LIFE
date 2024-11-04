const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config'); //server config file

// Get test_tags table from SQL
router.get('/', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM test_tags')
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server Error');
    }
})

module.exports = router;