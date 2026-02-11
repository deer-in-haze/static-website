// calendar.js
let currentYear;
let currentMonthIndex;

let skyEvents = [];
let eventsByDate = new Map();

async function loadSkyEvents() {
    const response = await fetch("./data/skycal.json");
    if (!response.ok) throw new Error("failed to load ./data/skycal.json");
    skyEvents = await response.json();

    eventsByDate = new Map();
    for (const ev of skyEvents) {
        if (!eventsByDate.has(ev.date)) eventsByDate.set(ev.date, []);
        eventsByDate.get(ev.date).push(ev);
    }
}

function renderCalendar(year, monthIndex) {
    const grid = document.getElementById("calendarGrid");
    const title = document.getElementById("monthTitle");
    if (!grid || !title) return;

    grid.innerHTML = "";

    const monthName = new Date(year, monthIndex).toLocaleString("default", { month: "long" });
    title.textContent = `${monthName} ${year}`;

    const firstDate = new Date(year, monthIndex, 1);
    const mondayIndex = (firstDate.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (let i = 0; i < mondayIndex; i++) grid.appendChild(createEmptyCell());
    for (let day = 1; day <= daysInMonth; day++) grid.appendChild(createDayCell(year, monthIndex, day));

    const totalCells = mondayIndex + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remaining; i++) grid.appendChild(createEmptyCell());
}

function toIsoDate(year, monthIndex, day) {
    const mm = String(monthIndex + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}

function createDayCell(year, monthIndex, day) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    const iso = toIsoDate(year, monthIndex, day);
    const todaysEvents = eventsByDate.get(iso) ?? [];

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    if (todaysEvents.length > 0) {
        const tags = document.createElement("div");
        tags.className = "event-tags";

        const maxTags = 2;
        todaysEvents.slice(0, maxTags).forEach((ev) => tags.appendChild(createTypeBadge(ev.type)));

        if (todaysEvents.length > maxTags) {
            const more = document.createElement("span");
            more.className = "calendar-event-badge calendar-event-badge--more";
            more.textContent = `+${todaysEvents.length - maxTags}`;
            tags.appendChild(more);
        }

        cell.appendChild(tags);

        cell.style.cursor = "pointer";
        cell.addEventListener("click", () => window.openEventModal(iso, todaysEvents));
        cell.title = todaysEvents.map((e) => e.title).join(" • ");
    }

    return cell;
}

function createEmptyCell() {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.style.visibility = "hidden";
    return cell;
}

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

function createTypeBadge(type) {
    const span = document.createElement("span");

    const safeType = String(type ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "");

    span.className = `calendar-event-badge calendar-event-badge--${safeType}`;
    span.textContent = window.helpers.typeLabel(type);

    return span;
}


async function init_calendar() {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonthIndex = now.getMonth();

    await loadSkyEvents();

    const prevBtn = document.getElementById("prevMonthBtn");
    const nextBtn = document.getElementById("nextMonthBtn");

    if (prevBtn) prevBtn.addEventListener("click", () => changeMonth(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => changeMonth(1));

    renderCalendar(currentYear, currentMonthIndex);
}
