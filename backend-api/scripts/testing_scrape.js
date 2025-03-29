const { chromium } = require("playwright");

function parseEventDate(dateStr) {
    const months = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    let start_time = null, end_time = null;
    
    // Match cases like "Mar 20, 9am - 4pm"
    let match = dateStr.match(/(\w{3}) (\d{1,2}), (\d{1,2})(am|pm) - (\d{1,2})(am|pm)/);
    if (match) {
        const [, month, day, startHour, startPeriod, endHour, endPeriod] = match;
        const currentYear = new Date().getFullYear();
        
        let startHour24 = convertTo24Hour(parseInt(startHour), startPeriod);
        let endHour24 = convertTo24Hour(parseInt(endHour), endPeriod);

        start_time = new Date(currentYear, months[month], parseInt(day), startHour24);
        end_time = new Date(currentYear, months[month], parseInt(day), endHour24);
        return { start_time, end_time };
    }

    // Match cases like "Mar 19-20"
    match = dateStr.match(/(\w{3}) (\d{1,2})-(\d{1,2})/);
    if (match) {
        const [, month, startDay, endDay] = match;
        const currentYear = new Date().getFullYear();
        start_time = new Date(currentYear, months[month], parseInt(startDay));
        end_time = new Date(currentYear, months[month], parseInt(endDay), 23, 59, 59);
        return { start_time, end_time };
    }

    // Match single-day events like "Mar 21"
    match = dateStr.match(/(\w{3}) (\d{1,2})/);
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
    while (months[targetMonth.split(" ")[0]] != endMonthRange){
        targetFrame = page.frameLocator('iframe[title^="Classic Table Calendar View"]');
        const eventRows = await targetFrame.locator("[class^='twSimpleTableEventRow0']").all();
        for (const row of eventRows) {
            const titleEl = await row.locator(".twDescription");
            const date = await row.locator(".twStartEndRange").innerText();
            const title = await titleEl.innerText();
    
            const { start_time, end_time } = parseEventDate(date);
            
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
            if (descriptionCount > 0){
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
})();