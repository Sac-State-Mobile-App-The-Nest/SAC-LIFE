const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config'); //server config file
const fetch = require('node-fetch');
const { parseStringPromise } = require('xml2js');
const { authenticateToken } = require('../middleware/studentAuthMiddleware');
const moment = require('moment-timezone');

module.exports = function(poolPromise) {

    router.post('/events', async (req, res) => {
        try {
            // Fetch the RSS feed
            const rssFeedUrl = 'https://www.trumba.com/calendars/sacramento-state-events.rss';
            const response = await fetch(rssFeedUrl);
            const xmlData = await response.text();

            // Parse XML data
            const result = await parseStringPromise(xmlData);
            const items = result.rss.channel[0].item;

            const events = items.map(item => {
                const rawDescription = item.description[0];
                let cleanDescription = rawDescription.replace(/^(.*?<br\/>.*?<br\/>)/g, '');
                cleanDescription = cleanDescription.replace(/<\/?[^>]+(>|$)/g, '');
                cleanDescription = cleanDescription.replace(/&nbsp;|&#8230;|&#8220;|&#8221;|&#160;/g, ' ')
                cleanDescription = cleanDescription.replace(/More.*/g, '')

                const eventTypeMatch = cleanDescription.match(/Event Type:\s*([^\n]+)/);
                const eventType = eventTypeMatch ? eventTypeMatch[1].trim() : 'Unknown';
                
                const parsedDate = new Date(item.pubDate[0]); 
                const formattedDate = isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString().slice(0, 19).replace('T', ' ');

                return {
                    title: item.title[0],
                    description: cleanDescription.replace(/Event Type:.*/, '').trim(),
                    eventType,
                    link: item.link[0],
                    date: formattedDate,
                };
            });

            const pool = await poolPromise;

            for (const event of events) {

                const checkResult = await pool.request()
                    .input('event_title', sql.NVarChar(255), event.title)
                    .input('event_date', sql.DateTime, event.date)
                    .query(`
                        SELECT COUNT(*) AS count FROM sac_events WHERE event_title = @event_title AND event_date = @event_date
                    `);

                if (checkResult.recordset[0].count === 0) {
                    await pool.request()
                        .input('event_title', sql.NVarChar(255), event.title)
                        .input('event_description', sql.NVarChar(sql.MAX), event.description)
                        .input('event_type', sql.NVarChar(255), event.eventType)
                        .input('event_link', sql.NVarChar(500), event.link)
                        .input('event_date', sql.DateTime, event.date)
                        .query(`
                            INSERT INTO sac_events (event_title, event_description, event_type, event_link, event_date)
                            VALUES (@event_title, @event_description, @event_type, @event_link, @event_date)
                        `);
                } else {
                    const existingEvent = checkResult.recordset[0];
                    if (existingEvent.event_date !== event.date) {
                        await pool.request()
                            .input('event_id', sql.Int, existingEvent.event_id)
                            .input('event_date', sql.DateTime, event.date)
                            .query(`
                                UPDATE sac_events SET event_date = @event_date WHERE event_id = @event_id
                            `);
                    }
                }
                
                
            }


            res.status(200).json({ message: 'Events stored successfully', events});
        } catch (err) {
            console.error('Error fetching events:', err);
            res.status(500).json({ error: 'Failed to fetch events'});
        }
    });

    // Send student created event from calendar dashboard
    router.post('/created-event', authenticateToken, async (req, res) => {
        const std_id = req.user.std_id;
        const { createdEvent }  = req.body;
        const { title, description, event_start_date, event_end_date } = createdEvent;
        console.log(createdEvent);
        console.log("Data: ", {std_id, title, description, event_start_date, event_end_date});
        try {
            const pool = await poolPromise;
            //stores the all the times in UTC format because database will try converting it to something else
            //even if it is in pst when sent to database
            const created_at = moment().tz("America/Los_Angeles").format("YYYY-MM-DD HH:mm:ss");
            await pool.request()
                .input('std_id', sql.Int, std_id)
                .input('event_title', sql.NVarChar(255), title)
                .input('event_description', sql.NVarChar(sql.MAX), description)
                .input('event_start_date', sql.DateTime, event_start_date)
                .input('event_end_date', sql.DateTime, event_end_date)
                .input('created_at', sql.DateTime2, created_at)
                .query(`
                    INSERT INTO student_created_events (std_id, event_title, event_description, event_start_date, event_end_date, created_at)
                    VALUES (@std_id, @event_title, @event_description, @event_start_date, @event_end_date, @created_at) 
                `);
            res.status(200).json({ message: 'Student Event stored successfully', createdEvent});
            
        } catch (err) {
            console.error('Failed to save event: ', err);
            res.status(500).send('Server Error');
        }
    });

    // update a student created event
    router.put('/update-created-event/:event_id', authenticateToken, async (req, res) => {
        const std_id = req.user.std_id;
        const { event_id } = req.params;
        const { title, description, event_start_date, event_end_date } = req.body.updatedEvent;
        console.log("Updating Event: ", { std_id, event_id, title, description, event_start_date, event_end_date });
        
        try {
            const pool = await poolPromise;
            await pool.request()
            .input('std_id', sql.Int, std_id)
            .input('event_id', sql.Int, event_id)
            .input('event_title', sql.NVarChar(255), title)
            .input('event_description', sql.NVarChar(sql.MAX), description)
            .input('event_start_date', sql.DateTime, event_start_date)
            .input('event_end_date', sql.DateTime, event_end_date)
            .query(`
                UPDATE student_created_events
                SET event_title = @event_title,
                    event_description = @event_description,
                    event_start_date = @event_start_date,
                    event_end_date = @event_end_date
                WHERE event_id = @event_id AND std_id = @std_id`);
        
            res.status(200).json({ message: 'Student Event updated successfully' });
        } catch (err) {
            console.error('Failed to update event: ', err);
            res.status(500).send('Server Error');
        }
    });

    //need an api to delete old events too

    //get all the events that a user created
    router.get('/getAllStudentEvents', authenticateToken, async(req, res) => {
        const std_id = req.user.std_id;
        try{
            const pool = await poolPromise;
            const result = await pool.request()
                .input('std_id', sql.Int, std_id)
                .query(`
                    SELECT event_id, event_title, event_description, event_start_date, event_end_date, created_at FROM student_created_events WHERE
                     @std_id = std_id AND event_end_date >= GETDATE() ORDER BY event_start_date ASC`);
 
             //convert the events from UTC to PST
             const events = result.recordset.map(event => ({
                 ...event,
                 event_start_date: moment.utc(event.event_start_date).tz("America/Los_Angeles").format("YYYY-MM-DD HH:mm:ss"),
                 event_end_date: moment.utc(event.event_end_date).tz("America/Los_Angeles").format("YYYY-MM-DD HH:mm:ss"),
                 created_at: moment.utc(event.created_at).tz("America/Los_Angeles").format("YYYY-MM-DD HH:mm:ss")
             }));
             // console.log(events);
             res.json(events);
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send('Server Error');
        }
    });


    //get all of the sac state events to send to the app 
    router.get('/getAllCampusEvents', authenticateToken, async(req, res) => {
        try{
            //(event_id, event_title, event_description, event_type, event_link, event_date)
            //only get the new events that haven't happened yet and order them by the date
            const result = await sql.query(`
                SELECT * FROM sac_events WHERE 
                event_start_date >= GETDATE() ORDER BY 
                event_start_date ASC`);
            //convert the events from UTC to PST
            const events = result.recordset.map(event => ({
                ...event,
                event_start_date: moment.utc(event.event_start_date).tz("America/Los_Angeles").format("YYYY-MM-DD HH:mm:ss"),
                event_end_date: moment.utc(event.event_end_date).tz("America/Los_Angeles").format("YYYY-MM-DD HH:mm:ss"),
            }));
            // console.log(events);
            res.json(events);
        } catch (err){
            console.error('SQL error', err);
            res.status(500).send('Server Error');
        }
    });

    //delete a student event
    router.delete('/deleteEvent/:event_id', authenticateToken, async (req, res) => {
        const { event_id } = req.params;
        const std_id = req.user.std_id; 
        try {
            const pool = await poolPromise;
    
            //delete event from database
            const result = await pool.request()
                .input('event_id', sql.Int, event_id)
                .input('std_id', sql.Int, std_id)
                .query(`
                    DELETE FROM student_created_events
                    WHERE event_id = @event_id AND std_id = @std_id`);
    
            //check if the event was deleted
            if (result.rowsAffected[0] > 0) {
                res.json({ success: true, message: 'Event deleted successfully.' });
            } else {
                res.status(404).json({ success: false, message: 'Event not found or not authorized to delete.' });
            }
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send('Server Error');
        }
    });

    return router;
};