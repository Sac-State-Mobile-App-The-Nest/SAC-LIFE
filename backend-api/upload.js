const sql = require("mssql");
const config = require('./config');
const fs = require('fs');

async function insertEventsToDB(events) {
    try {
        await sql.connect(config);

        await sql.query`TRUNCATE TABLE sac_events`;

        const table = new sql.Table('sac_events');
        table.create = false;
        table.columns.add('event_title', sql.NVarChar(255), { nullable: true });
        table.columns.add('event_description', sql.NVarChar(sql.MAX), { nullable: true });
        table.columns.add('event_link', sql.NVarChar(500), { nullable: true });
        table.columns.add('event_start_date', sql.DateTime, { nullable: true });
        table.columns.add('event_end_date', sql.DateTime, { nullable: true });

        for (const event of events) {
            table.rows.add(
                event.title,
                event.eventDescriptions,
                event.eventUrl,
                event.start_time,
                event.end_time
            );
        }

        const transaction = new sql.Transaction();
        await transaction.begin();
        const request = new sql.Request(transaction);
        await request.bulk(table);
        await transaction.commit();

        console.log("✅ Bulk insert complete. Total events:", events.length);
    } catch (err) {
        console.error("❌ SQL Insert Error:", err);
    } finally {
        await sql.close();
    }
}

async function uploadEvents() {
    try {
        const rawData = fs.readFileSync('sac_events_backup.json');
        const sac_events = JSON.parse(rawData);

        console.log('🔄 Uploading data to database...');
        await insertEventsToDB(sac_events);
    } catch (err) {
        console.error("❌ Error reading or uploading data:", err);
    }
}

uploadEvents();