const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config'); //server config file
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { parseStringPromise } = require('xml2js');

module.exports = function(poolPromise) {

    router.get('/events', async (req, res) => {
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
                let cleanDescription = rawDescription.replace(/<\/?[^>]+(>|$)/g, '');
                cleanDescription = cleanDescription.replace(/&nbsp;|&#8230;|&#8220;|&#8221;/g, ' ')

                const eventTypeMatch = cleanDescription.match(/Event Type:\s*([^\n]+)/);
                const eventType = eventTypeMatch ? eventTypeMatch[1].trim() : 'Unknown';
                
                return {
                    title: item.title[0],
                    description: cleanDescription.replace(/Event Type:.*/, '').trim(),
                    eventType,
                    link: item.link[0],
                    date: item.pubDate[0],
                };
            });

            res.json(events);
        } catch (err) {
            console.error('Error fetching events:', err);
            res.status(500).json({ error: 'Failed to fetch events'});
        }
    });

    return router;
};