const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config'); //server config file
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fetch = require('node-fetch');
const { parseStringPromise } = require('xml2js');
const { authenticateToken } = require('../authMiddleware');

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
        const { title, description, event_date, time } = createdEvent;
        const sqlDatetime = event_date + " " + time;
        console.log(createdEvent);
        console.log("Data: ", {std_id, title, description, event_date, time});
        try {
            const pool = await poolPromise;

            await pool.request()
                .input('std_id', sql.Int, std_id)
                .input('event_title', sql.NVarChar(255), title)
                .input('event_description', sql.NVarChar(sql.MAX), description)
                .input('event_date', sql.DateTime, sqlDatetime)
                .query(`
                   INSERT INTO student_created_events (std_id, event_title, event_description, event_date)
                   VALUES (@std_id, @event_title, @event_description, @event_date) 
                `);
            res.status(200).json({ message: 'Student Event stored successfully', createdEvent});
            
        } catch (err) {
            console.error('Failed to send created event: ', err);
            res.status(500).send('Server Error');
        }
    });

    return router;
};