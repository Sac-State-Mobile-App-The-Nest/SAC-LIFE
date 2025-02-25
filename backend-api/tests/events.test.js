const request = require('supertest');
const express = require('express');
const sql = require('mssql');
const fetch = require('node-fetch');
const { parseStringPromise } = require('xml2js');
const eventsRoute = require('../routes/events');


jest.mock('mssql', () => {
    return {
        connect: jest.fn().mockResolvedValue({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({ recordset: [{ title: 'Sample Event' }] })
        }),
        Request: jest.fn(() => ({
            input: jest.fn().mockReturnThis(),
            query: jest.fn(),
        })),
    };
});
jest.mock('node-fetch');
jest.mock('xml2js', () => ({ parseStringPromise: jest.fn() }));


const mockRequest = {
    input: jest.fn().mockReturnThis(),
    query: jest.fn(),
};

const mockPool = {
    request: jest.fn(() => mockRequest),
    query: jest.fn(),
};

describe('POST /events', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api', eventsRoute(() => Promise.resolve(mockPool)));
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch and store new events', async () => {
        const mockXmlData = `<?xml version="1.0" encoding="UTF-8"?>
            <rss>
                <channel>
                    <item>
                        <title>Sample Event</title>
                        <description>Event details here<br/><br/>Event Type: Lecture</description>
                        <link>https://example.com/event</link>
                        <pubDate>Mon, 26 Feb 2024 12:00:00 GMT</pubDate>
                    </item>
                </channel>
            </rss>`;
        
        fetch.mockResolvedValue({ text: jest.fn().mockResolvedValue(mockXmlData) });
        console.log("Mock XML Data: ", mockXmlData);
        parseStringPromise.mockResolvedValue({
            rss: {
                channel: [{
                    item: [{
                        title: ['Sample Event'],
                        description: ['Event details here<br/><br/>Event Type: Lecture'],
                        link: ['https://example.com/event'],
                        pubDate: ['Mon, 26 Feb 2024 12:00:00 GMT'],
                    }],
                }],
            },
        });

        const parsedXml = await parseStringPromise(mockXmlData);

        console.log("Mock Parsed XML: ", await parseStringPromise(parsedXml.rss.channel[0].item));

        mockPool.query
            .mockResolvedValueOnce({ recordset: [{ count: 0 }] })
            .mockResolvedValueOnce({});


        const response = await request(app).post('/api/events');
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Events stored successfully');
        expect(response.body.events).toHaveLength(1);
        expect(response.body.events[0].title).toBe('Sample Event');

        expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT COUNT(*)'));
        expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO sac_events'));
    });

    it('should handle fetch errors', async () => {
        fetch.mockRejectedValue(new Error('Network error'));

        const response = await request(app).post('/api/events');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to fetch events');
    });
});
