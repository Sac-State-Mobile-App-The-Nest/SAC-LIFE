const { chromium } = require("playwright");
const sql = require("mssql");
const config = require('./config');
const fs = require('fs');


function parseEventDate(dateStr) {
    const months = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    let start_time = null, end_time = null;

    /*  
        Match cases for:
        Apr 8, 10:30 - 11:45am
        Apr 8, 10:30am - 3:30pm
        Apr 6, 6 - 7:30pm
        Mar 20, 9am - 4pm
        Mar 20, 4 - 6pm
        Apr 7, 1:30 - 3pm
        Apr 6, 6 - 7:30pm
    
    */
    let match = dateStr.match(/(\w{3}) (\d{1,2}), (\d{1,2}):?(\d{2})?(am|pm)? - ?(\d{1,2}):?(\d{2})?(am|pm)/);
    console.log(typeof(dateStr), dateStr);
    console.log("first:",match);
    if (match) {

        let [, month, day, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = match;
        const currentYear = new Date().getFullYear();

        if (!startMin) startMin = 0;
        if (!endMin) endMin = 0;

        let startHour24 = startPeriod ? convertTo24Hour(parseInt(startHour), startPeriod) : convertTo24Hour(parseInt(startHour), endPeriod);
        let endHour24 = convertTo24Hour(parseInt(endHour), endPeriod);

        start_time = new Date(currentYear, months[month], day, startHour24, startMin)
        end_time = new Date(currentYear, months[month], day, endHour24, endMin);
        return { start_time, end_time };
    }

    /*
        Match cases for:
        Apr 14, 4:30pm – Apr 16, 7:30pm
        Apr 15, 12pm – Apr 18, 4pm
    */
    match = dateStr.match(/(\w{3}) (\d{1,2}), (\d{1,2}):?(\d{2})?(am|pm) - (\w{3}) (\d{1,2}), ?(\d{1,2}):?(\d{2})?(am|pm)/);
    console.log("second:",match);
    if (match) {
        let [, startMonth, startDay, startHour, startMin, startPeriod, endMonth, endDay, endHour, endMin, endPeriod] = match;
        const currentYear = new Date().getFullYear();

        if (!startMin) startMin = 0;
        if (!endMin) endMin = 0;

        let startHour24 = convertTo24Hour(parseInt(startHour), startPeriod);
        let endHour24 = convertTo24Hour(parseInt(endHour), endPeriod);

        start_time = new Date(currentYear, months[startMonth], startDay, startHour24, startMin);
        end_time = new Date(currentYear, months[endMonth], endDay, endHour24, endMin);
        return { start_time, end_time };
    }

    // Match cases like "Mar 19-20"
    match = dateStr.match(/(\w{3}) (\d{1,2})-(\d{1,2})/);
    console.log("third:",match);
    if (match) {
        const [, month, startDay, endDay] = match;
        const currentYear = new Date().getFullYear();
        start_time = new Date(currentYear, months[month], parseInt(startDay));
        end_time = new Date(currentYear, months[month], parseInt(endDay), 23, 59, 59);
        return { start_time, end_time };
    }

    // Match single-day events like "Mar 21"
    match = dateStr.match(/(\w{3}) (\d{1,2})/);
    console.log("fourth:",match);
    if (match) {
        const [, month, day] = match;
        const currentYear = new Date().getFullYear();
        start_time = new Date(currentYear, months[month], parseInt(day));
        end_time = new Date(currentYear, months[month], parseInt(day), 23, 59, 59);
        return { start_time, end_time };
    }

    return { start_time, end_time };
}

// Convert 12-hour format to 24-hour format
function convertTo24Hour(hour, period) {
    if (period === "am" && hour === 12) return 0; // 12 AM is 0 in 24-hour time
    if (period === "pm" && hour !== 12) return hour + 12; // Convert PM times
    return hour; // Return the same hour for other cases
}

async function insertEventsToDB(events) {
    try {
        await sql.connect(config);

        const table = new sql.Table('sac_events');
        table.create = false;
        table.columns.add('event_title', sql.NVarChar(255), { nullable: true });
        table.columns.add('event_description', sql.NVarChar(sql.MAX), { nullable: true });
        table.columns.add('event_link', sql.NVarChar(500), { nullable: true });
        table.columns.add('start_date', sql.DateTime, { nullable: true });
        table.columns.add('end_date', sql.DateTime, { nullable: true });

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


(async () => {
    const URL = 'https://events.csus.edu';
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(URL, { waitUntil: 'domcontentloaded' });

    let targetFrame = page.frameLocator('iframe[title="Classic Table Calendar View"]');

    let targetMonth = await targetFrame.locator(".twSimpleTableGroupHead").innerText();


    const months = {
        JANUARY: 0, FEBRUARY: 1, MARCH: 2, APRIL: 3, MAY: 4, JUNE: 5,
        JULY: 6, AUGUST: 7, SEPTEMBER: 8, OCTOBER: 9, NOVEMBER: 10, DECEMBER: 11
    };

    const endMonthRange = (months[targetMonth.split(" ")[0]] + 2) % 12;
    let sac_events = [];
    while (months[targetMonth.split(" ")[0]] != endMonthRange) {
        targetFrame = page.frameLocator('iframe[title^="Classic Table Calendar View"]');
        const eventRows = await targetFrame.locator("[class^='twSimpleTableEventRow0']").all();
        for (const row of eventRows) {
            const titleEl = await row.locator(".twDescription");
            let date = await row.locator(".twStartEndRange").innerText();
            const title = await titleEl.innerText();
            date = date
                .replace(/\u2013|\u2014/g, "-")
                .replace(/\u00A0/g, " ")     
                .trim();

            const { start_time, end_time } = parseEventDate(date);
            console.log("start:",start_time);
            console.log("end:",end_time);

            const linkEl = titleEl.locator("a");
            const eventUrl = await linkEl.getAttribute("href");

            const eventPage = await context.newPage();
            await eventPage.goto(eventUrl, { waitUntil: "domcontentloaded" });
            console.log(eventPage.url());

            const iframeEventPage = eventPage.frameLocator('iframe[title="Event Detail - Enhanced"]');
            const descriptionEl = await iframeEventPage.locator(".twEDNotes");
            await eventPage.waitForTimeout(1000);
            const descriptionCount = await descriptionEl.count();
            console.log(descriptionCount);
            let eventDescriptions = "None";
            if (descriptionCount > 0) {
                eventDescriptions = await iframeEventPage.locator(".twEDNotes").innerText();
                eventDescriptions = eventDescriptions.replace(/\n+/g, " ").trim();
            }

            await eventPage.close();
            sac_events.push({ start_time, end_time, title, eventUrl, eventDescriptions });
        }

        targetMonth = await targetFrame.locator(".twSimpleTableGroupHead").innerText();
        console.log(targetMonth);
        targetFrame.getByTitle("Next Page").first().click();
        await page.waitForTimeout(2000);
    }

    console.log(sac_events);
    browser.close();
    
    fs.writeFileSync('sac_events_backup.json', JSON.stringify(sac_events, null, 2));
    console.log('📝 Scraped data saved to sac_events_backup.json');

    await insertEventsToDB(sac_events);

})();