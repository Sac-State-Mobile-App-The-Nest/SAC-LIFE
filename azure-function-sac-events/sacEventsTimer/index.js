const { chromium } = require("playwright");
const sql = require("mssql");
const config = require("../config");
const fs = require("fs");

module.exports = async function (context, myTimer) {
  context.log("🟢 Sac State Event Timer Trigger Fired");

  try {
    const events = await scrapeEvents(context);
    await uploadEvents(events, context);
    context.log(`✅ ${events.length} events scraped and uploaded`);
  } catch (err) {
    context.log.error("❌ Function error:", err);
  }
};

// Scraper logic
async function scrapeEvents(context) {
  const URL = "https://events.csus.edu";
  const browser = await chromium.launch({ headless: true });
  const contextBrowser = await browser.newContext();
  const page = await contextBrowser.newPage();

  await page.goto(URL, { waitUntil: "domcontentloaded" });
  let targetFrame = page.frameLocator('iframe[title="Classic Table Calendar View"]');
  let targetMonth = await targetFrame.locator(".twSimpleTableGroupHead").innerText();

  const months = {
    JANUARY: 0, FEBRUARY: 1, MARCH: 2, APRIL: 3, MAY: 4, JUNE: 5,
    JULY: 6, AUGUST: 7, SEPTEMBER: 8, OCTOBER: 9, NOVEMBER: 10, DECEMBER: 11
  };

  const endMonthRange = (months[targetMonth.split(" ")[0]] + 2) % 12;
  const sac_events = [];

  while (months[targetMonth.split(" ")[0]] !== endMonthRange) {
    const eventRows = await targetFrame.locator("[class^='twSimpleTableEventRow0']").all();
    for (const row of eventRows) {
      const titleEl = await row.locator(".twDescription");
      let date = await row.locator(".twStartEndRange").innerText();
      const title = await titleEl.innerText();

      date = date.replace(/\u2013|\u2014/g, "-").replace(/\u00A0/g, " ").trim();
      const { start_time, end_time } = parseEventDate(date);

      const linkEl = titleEl.locator("a");
      const eventUrl = await linkEl.getAttribute("href");

      const eventPage = await contextBrowser.newPage();
      await eventPage.goto(eventUrl, { waitUntil: "domcontentloaded" });

      let eventDescriptions = "None";
      await eventPage.waitForTimeout(1000);

      try {
        const iframeEventPage = eventPage.frameLocator('iframe[title="Event Detail - Enhanced"]');
        const descriptionEl = iframeEventPage.locator(".twEDNotes");

        const count = await descriptionEl.count();
        if (count > 0) {
          eventDescriptions = await descriptionEl.innerText();
          eventDescriptions = eventDescriptions.replace(/\n+/g, " ").trim();
        } else {
          context.log(`⚠️ No description found for: ${eventUrl}`);
        }
      } catch (err) {
        context.log(`⚠️ Could not load event description iframe for: ${eventUrl}`);
        context.log.error(err);
      }

      await eventPage.close();
      sac_events.push({ start_time, end_time, title, eventUrl, eventDescriptions });
    }

    targetMonth = await targetFrame.locator(".twSimpleTableGroupHead").innerText();
    await targetFrame.getByTitle("Next Page").first().click();
    await page.waitForTimeout(2000);
  }

  await browser.close();
  return sac_events;
}

// Upload logic
async function uploadEvents(events, context) {
  try {
    await sql.connect(config);
    await sql.query`TRUNCATE TABLE sac_events`;

    const table = new sql.Table("sac_events");
    table.create = false;
    table.columns.add("event_title", sql.NVarChar(255), { nullable: true });
    table.columns.add("event_description", sql.NVarChar(sql.MAX), { nullable: true });
    table.columns.add("event_link", sql.NVarChar(500), { nullable: true });
    table.columns.add("event_start_date", sql.DateTime, { nullable: true });
    table.columns.add("event_end_date", sql.DateTime, { nullable: true });

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
  } catch (err) {
    context.log.error("❌ Upload error:", err);
  } finally {
    await sql.close();
  }
}

// Utility functions (same as your scrape.js)
function convertTo24Hour(hour, period) {
  if (period === "am" && hour === 12) return 0;
  if (period === "pm" && hour !== 12) return hour + 12;
  return hour;
}

function parseEventDate(dateStr) {
  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };

  const currentYear = new Date().getFullYear();
  let match;

  match = dateStr.match(/(\w{3}) (\d{1,2}), (\d{1,2}):?(\d{2})?(am|pm)? - ?(\d{1,2}):?(\d{2})?(am|pm)/);
  if (match) {
    let [, month, day, sh, sm = 0, sp, eh, em = 0, ep] = match;
    const startHour = sp ? convertTo24Hour(parseInt(sh), sp) : convertTo24Hour(parseInt(sh), ep);
    const endHour = convertTo24Hour(parseInt(eh), ep);
    return {
      start_time: new Date(currentYear, months[month], day, startHour, sm),
      end_time: new Date(currentYear, months[month], day, endHour, em)
    };
  }

  match = dateStr.match(/(\w{3}) (\d{1,2}), (\d{1,2}):?(\d{2})?(am|pm) - (\w{3}) (\d{1,2}), ?(\d{1,2}):?(\d{2})?(am|pm)/);
  if (match) {
    let [, smon, sday, sh, smin = 0, sp, emon, eday, eh, emin = 0, ep] = match;
    return {
      start_time: new Date(currentYear, months[smon], sday, convertTo24Hour(sh, sp), smin),
      end_time: new Date(currentYear, months[emon], eday, convertTo24Hour(eh, ep), emin)
    };
  }

  match = dateStr.match(/(\w{3}) (\d{1,2})-(\d{1,2})/);
  if (match) {
    let [, month, sday, eday] = match;
    return {
      start_time: new Date(currentYear, months[month], parseInt(sday)),
      end_time: new Date(currentYear, months[month], parseInt(eday), 23, 59)
    };
  }

  match = dateStr.match(/(\w{3}) (\d{1,2})/);
  if (match) {
    let [, month, day] = match;
    return {
      start_time: new Date(currentYear, months[month], parseInt(day)),
      end_time: new Date(currentYear, months[month], parseInt(day), 23, 59)
    };
  }

  return { start_time: null, end_time: null };
}
