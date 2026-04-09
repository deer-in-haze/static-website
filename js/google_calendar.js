// google_calendar.js — builds "Add to Google Calendar" URLs for sky events

(() => {
    // Formats a Date as a Google Calendar datetime string (YYYYMMDDTHHmmssZ)
    const gcalDateTimeUtc = (date) =>
        date.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

    // Parses an ISO date + UTC time string into a Date object
    const parseUtc = (isoDate, timeUtc) =>
        new Date(`${isoDate}T${timeUtc}:00Z`);

    // Returns a pre-filled Google Calendar event URL for the given sky event
    window.googleCalendarUrlForEvent = (isoDate, ev) => {
        const start = parseUtc(isoDate, ev.time_utc);
        const end   = new Date(start.getTime() + 60 * 60 * 1000); // default 1-hour duration

        const dates = `${gcalDateTimeUtc(start)}/${gcalDateTimeUtc(end)}`;

        const details = [ev.description ?? "", ev.source ? `Source: ${ev.source}` : ""]
            .filter(Boolean)
            .join("\n\n");

        const params = new URLSearchParams({
            action: "TEMPLATE",
            text: ev.title,
            dates,
            details,
        });

        return `https://calendar.google.com/calendar/render?${params}`;
    };
})();
