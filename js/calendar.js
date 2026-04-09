// calendar.js — builds the monthly sky-events calendar grid and wires up month navigation

(() => {
    let currentYear;
    let currentMonthIndex;
    let eventsByDate = new Map();

    // ── Data loading ──────────────────────────────────────────────────────────

    async function loadSkyEvents() {
        const res = await fetch("./data/skycal.json");
        if (!res.ok) throw new Error("failed to load ./data/skycal.json");

        const events = await res.json();

        eventsByDate = new Map();
        for (const ev of events) {
            if (!eventsByDate.has(ev.date)) eventsByDate.set(ev.date, []);
            eventsByDate.get(ev.date).push(ev);
        }
    }

    // ── Rendering ─────────────────────────────────────────────────────────────

    function renderCalendar(year, monthIndex) {
        const grid  = document.getElementById("calendarGrid");
        const title = document.getElementById("monthTitle");
        if (!grid || !title) return;

        grid.innerHTML = "";

        const monthName = new Date(year, monthIndex).toLocaleString("default", { month: "long" });
        title.textContent = `${monthName} ${year}`;

        const firstDay    = new Date(year, monthIndex, 1);
        const leadingDays = (firstDay.getDay() + 6) % 7; // shift Sunday-first to Monday-first
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        for (let i = 0; i < leadingDays; i++) grid.appendChild(createEmptyCell());
        for (let day = 1; day <= daysInMonth; day++) grid.appendChild(createDayCell(year, monthIndex, day));

        const totalCells = leadingDays + daysInMonth;
        const trailingDays = (7 - (totalCells % 7)) % 7;
        for (let i = 0; i < trailingDays; i++) grid.appendChild(createEmptyCell());
    }

    function createEmptyCell() {
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        cell.style.visibility = "hidden";
        return cell;
    }

    function createDayCell(year, monthIndex, day) {
        const cell = document.createElement("div");
        cell.className = "calendar-day";

        const iso    = toIsoDate(year, monthIndex, day);
        const events = eventsByDate.get(iso) ?? [];

        const dayNumber = document.createElement("div");
        dayNumber.className = "day-number";
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        if (events.length > 0) {
            cell.appendChild(createEventTags(events));
            cell.style.cursor = "pointer";
            cell.title = events.map((e) => e.title).join(" • ");
            cell.addEventListener("click", () => window.openEventModal(iso, events));
        }

        return cell;
    }

    function createEventTags(events) {
        const MAX_VISIBLE = 2;
        const tags = document.createElement("div");
        tags.className = "event-tags";

        events.slice(0, MAX_VISIBLE).forEach((ev) => tags.appendChild(createTypeBadge(ev.type)));

        if (events.length > MAX_VISIBLE) {
            const more = document.createElement("span");
            more.className = "calendar-event-badge calendar-event-badge--more";
            more.textContent = `+${events.length - MAX_VISIBLE}`;
            tags.appendChild(more);
        }

        return tags;
    }

    function createTypeBadge(type) {
        const safeType = String(type ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
        const span = document.createElement("span");
        span.className = `calendar-event-badge calendar-event-badge--${safeType}`;
        span.textContent = window.helper.typeLabel(type);
        return span;
    }

    // ── Navigation ────────────────────────────────────────────────────────────

    function changeMonth(delta) {
        currentMonthIndex += delta;

        if (currentMonthIndex < 0) {
            currentMonthIndex = 11;
            currentYear -= 1;
        } else if (currentMonthIndex > 11) {
            currentMonthIndex = 0;
            currentYear += 1;
        }

        renderCalendar(currentYear, currentMonthIndex);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    function toIsoDate(year, monthIndex, day) {
        const mm = String(monthIndex + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        return `${year}-${mm}-${dd}`;
    }

    // ── Init (called from main.js after the calendar partial is injected) ─────

    async function init_calendar() {
        const now = new Date();
        currentYear       = now.getFullYear();
        currentMonthIndex = now.getMonth();

        await loadSkyEvents();

        document.getElementById("prevMonthBtn")?.addEventListener("click", () => changeMonth(-1));
        document.getElementById("nextMonthBtn")?.addEventListener("click", () => changeMonth(1));

        renderCalendar(currentYear, currentMonthIndex);
    }

    window.init_calendar = init_calendar;
})();
