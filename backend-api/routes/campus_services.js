const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get test_campus_services table from SQL
router.get('/', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM test_campus_services')
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server Error');
    }
})

// Get campus services that relates to student
router.get('/:studentId', async (req, res) => {
    const { studentId } = req.params;

    try {
        const request = new sql.Request();

        request.input('studentId', sql.Int, studentId);

        const result = await request.query(`
            SELECT * 
            FROM test_campus_services cs 
            JOIN test_tag_service ts ON cs.service_id = ts.service_id
            JOIN test_tags t ON ts.tag_id = t.tag_id
            JOIN test_student_tags st ON t.tag_id = st.tag_id
            WHERE st.std_id = @studentId
            `)
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server Error');
    }
})

module.exports = router;