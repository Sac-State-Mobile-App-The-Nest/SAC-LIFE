const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config'); //server config file
const { authenticateToken } = require('../authMiddleware');

module.exports = function(poolPromise) {

    // Get test_campus_services table from SQL
    router.get('/', async (req, res) => {
        try {
            const result = await sql.query('SELECT * FROM test_campus_services')
            res.json(result.recordset);
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send('Server Error');
        }
    });

    //Get campus services that relates to student
    router.get('/student/:studentId', async (req, res) => {
        const { studentId } = req.params;

        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('studentId', sql.Int, studentId)
                .query(`
                    SELECT serv_name, service_desc, service_link
                    FROM test_campus_services cs 
                    JOIN test_tag_service ts ON cs.service_id = ts.service_id
                    JOIN test_tags t ON ts.tag_id = t.tag_id
                    JOIN test_student_tags st ON t.tag_id = st.tag_id
                    WHERE st.std_id = @studentId
                    `)

            // console.log(result.recordset);
            res.json(result.recordset);
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send('Server Error');
        } finally {
            // Close the database connection
            await sql.close();
        }
    });

    //same function, but uses req.body if param not available
    router.get('/servicesRecommendation', authenticateToken, async (req, res) => {
        try {
            const std_id = req.user.std_id; //data that was sent in from front end is std_id
            // console.log('Console logging std_id: ',std_id);
            //retrieve campus services based recommended based on std_id
            const pool = await poolPromise;
            const servicesList = await pool.request()
                .input('std_id', sql.Int, std_id)
                .query(`SELECT serv_name, service_desc, service_link, service_phone, service_email, service_location
                    FROM test_student_tags, test_tag_service, test_campus_services 
                    WHERE @std_id = test_student_tags.std_id 
                    AND test_student_tags.tag_id = test_tag_service.tag_id 
                    AND test_tag_service.service_id = test_campus_services.service_id`);
            //check if there were errors
            //console.log('service list:', servicesList)
            if (servicesList.recordset.length === 0){
                return res.status(404).json({ message: 'Student not found in database' });
            }
            // console.log('Services: ', servicesList.recordset);
            res.json(servicesList.recordset);
        } catch (err){
            console.error('SQL error', err);
            res.status(500).json({ message: 'Backend server error' });
        }
    });

    return router;
};