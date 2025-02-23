const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config'); //server config file
const { authenticateToken } = require('../authMiddleware');
const { verifyRole,  authenticateToken: adminAuthToken } = require('../middleware/authMiddleware');

module.exports = function(poolPromise) {

    //Get all campus services
    router.get('/getAllServices/', async (req, res) => {
        try {
            const result = await sql.query('SELECT serv_name, service_link FROM test_campus_services')
            res.json(result.recordset);
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send('Server Error');
        }
    });

    //Get campus services but only the service_id and service name
    router.get('/getServIDAndName', adminAuthToken, async (req, res) => {
        try {
          const pool = await poolPromise;
          const result = await pool.request().query('SELECT service_id, serv_name FROM test_campus_services');
          res.json(result.recordset);
        } catch (err) {
          console.error('SQL error (fetching campus services):', err.message);
          res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
      });
        // GET campus service tags for a specific student for admin website
       router.get('/studentTags/:studentId', adminAuthToken, verifyRole(['super-admin']), async (req, res) => {
        const { studentId } = req.params;
        try {
        const pool = await poolPromise;
        // This query should return rows with tag_id values
        const result = await pool.request()
            .input('studentId', sql.Int, studentId)
            .query('SELECT tag_id FROM test_tag_service WHERE std_id = @studentId');
        res.json(result.recordset); // e.g., [ { tag_id: 1 }, { tag_id: 3 } ]
        } catch (err) {
        console.error('SQL error (fetching student tags):', err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
       });

    // PUT update a student's campus service tags for admin website
    router.put('/studentTags/:studentId', adminAuthToken, verifyRole(['super-admin']), async (req, res) => {
        const { studentId } = req.params;
        const { tags } = req.body; // expecting an array of service IDs
        try {
        const pool = await poolPromise;
        const transaction = await pool.transaction();
        await transaction.begin();
        
        // Remove existing associations
        await transaction.request()
            .input('studentId', sql.Int, studentId)
            .query('DELETE FROM test_tag_service WHERE std_id = @studentId');
        
        // Insert new associations if any tags are provided
        if (tags && tags.length > 0) {
            const insertValues = tags.map((tagId, index) => `(@studentId, @tag${index})`).join(', ');
            const request = transaction.request();
            request.input('studentId', sql.Int, studentId);
            tags.forEach((tagId, index) => {
            request.input(`tag${index}`, sql.Int, tagId);
            });
            await request.query(`INSERT INTO test_tag_service (std_id, tag_id) VALUES ${insertValues}`);
        }
        
        await transaction.commit();
        res.json({ message: 'Student tags updated successfully' });
        } catch (err) {
        console.error('SQL error (updating student tags):', err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
    });
  

    //Get campus services that relates to student
    router.get('/student/:studentId', async (req, res) => {
        const { studentId } = req.params;
        //will no longer show repeted entries
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('studentId', sql.Int, studentId)
                .query(`
                    SELECT DISTINCT serv_name, service_desc, service_link
                    FROM test_campus_services cs 
                    JOIN test_tag_service ts ON cs.service_id = ts.service_id
                    WHERE ts.tag_id IN (
                    SELECT st.tag_id FROM test_student_tags st WHERE st.std_id = @studentId
                    )`)
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

    //retrieve campus services based recommended based on std_id, shows just the name and link to site for dashboard
    router.get('/servicesRecommendation', authenticateToken, async (req, res) => {
        try {
            const std_id = req.user.std_id; //data that was sent in from front end is std_id
            const pool = await poolPromise;
            const servicesList = await pool.request()
                .input('std_id', sql.Int, std_id)
                .query(`SELECT DISTINCT serv_name, service_link
                    FROM test_student_tags, test_tag_service, test_campus_services 
                    WHERE @std_id = test_student_tags.std_id 
                    AND test_student_tags.tag_id = test_tag_service.tag_id 
                    AND test_tag_service.service_id = test_campus_services.service_id`);
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

    //same as /servicesRecommendation, but uses all parameters if needed only
    router.get('/servicesRecommendationMore', authenticateToken, async (req, res) => {
        try {
            const std_id = req.user.std_id; //data that was sent in from front end is std_id
            // console.log('Console logging std_id: ',std_id);
            const pool = await poolPromise;
            const servicesList = await pool.request()
                .input('std_id', sql.Int, std_id)
                .query(`SELECT DISTINCT serv_name, service_link, service_phone, service_email, service_location
                    FROM test_student_tags, test_tag_service, test_campus_services 
                    WHERE @std_id = test_student_tags.std_id 
                    AND test_student_tags.tag_id = test_tag_service.tag_id 
                    AND test_tag_service.service_id = test_campus_services.service_id`);
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

    //For admin to add more campus services to the database
    router.post('/addService', authenticateToken, async (req, res) => {
        try{
            const { serv_name, service_desc, service_link, service_phone, service_email, service_location } = req.body;
            if (!serv_name || !service_link){
                return res.status(400).json({ error: 'Service name and link are required'});
            }
            const pool = await sql.connect();
            const result = await pool.request()
                .input('serv_name', sql.VarChar(100), serv_name)
                .input('service_desc', sql.VarChar(1200), service_desc)
                .input('service_link', sql.VarChar(2048), service_link)
                .input('service_phone', sql.VarChar(15), service_phone)
                .input('service_email', sql.VarChar(254), service_email)
                .input('service_location', sql.VarChar(70), service_location)
                .query(`
                    INSERT INTO test_campus_services 
                    (serv_name, service_desc, service_link, service_phone, service_email, service_location) 
                    VALUES (@serv_name, @service_desc, @service_link, @service_phone, @service_email, @service_location)
                `);
            res.status(201).json({ message: 'Service added successfully', serviceId: result.recordset});
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send('Server error processing');
        }
    });

    return router;
};