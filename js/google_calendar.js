(() => {

    const gcalDateTimeUtc = (date) =>
        date.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

    const parseUtc = (isoDate, timeUtc) => {
        return new Date(`${isoDate}T${timeUtc}:00Z`);
    };

    window.googleCalendarUrlForEvent = (isoDate, ev) => {
        const start = parseUtc(isoDate, ev.time_utc);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        const dates =
            `${gcalDateTimeUtc(start)}/${gcalDateTimeUtc(end)}`;

        const details = [
            ev.description ?? "",
            ev.source ? `Source: ${ev.source}` : ""
        ]
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
