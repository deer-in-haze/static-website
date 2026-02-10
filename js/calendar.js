let currentYear;
let currentMonthIndex;

let skyEvents = [];
let eventsByDate = new Map();

async function loadSkyEvents() {
    const response = await fetch("data/skycal.json");
    if (!response.ok) throw new Error("failed to load data/skycal.json");
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

    grid.innerHTML = "";

    const monthName = new Date(year, monthIndex).toLocaleString("default", { month: "long" });
    title.textContent = `${monthName} ${year}`;

    const firstDate = new Date(year, monthIndex, 1);

    const mondayIndex = (firstDate.getDay() + 6) % 7;

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (let i = 0; i < mondayIndex; i++) {
        grid.appendChild(createEmptyCell());
    }

    for (let day = 1; day <= daysInMonth; day++) {
        grid.appendChild(createDayCell(year, monthIndex, day));
    }

    const totalCells = mondayIndex + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;

    for (let i = 0; i < remaining; i++) {
        grid.appendChild(createEmptyCell());
    }
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
        todaysEvents.slice(0, maxTags).forEach(ev => {
            tags.appendChild(createTypeBadge(ev.type));
        });

        if (todaysEvents.length > maxTags) {
            const more = document.createElement("span");
            more.className = "badge bg-dark";
            more.textContent = `+${todaysEvents.length - maxTags}`;
            tags.appendChild(more);
        }

        cell.appendChild(tags);

        cell.style.cursor = "pointer";
        cell.addEventListener("click", () => openEventModal(iso, todaysEvents));

        cell.title = todaysEvents.map(e => e.title).join(" • ");
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

document.addEventListener("DOMContentLoaded", async () => {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonthIndex = now.getMonth();

    await loadSkyEvents();

    document.getElementById("prevMonthBtn").addEventListener("click", () => changeMonth(-1));
    document.getElementById("nextMonthBtn").addEventListener("click", () => changeMonth(1));

    renderCalendar(currentYear, currentMonthIndex);
});

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function badgeClassForType(type) {
    const map = {
        meteor_shower: "bg-info",
        moon_phase: "bg-light text-dark",
        solar_eclipse: "bg-warning text-dark",
        lunar_eclipse: "bg-primary",
        opposition: "bg-success",
        conjunction: "bg-success",
        seasonal: "bg-secondary",
    };
    return map[type] ?? "bg-dark";
}

function createTypeBadge(type) {
    const span = document.createElement("span");
    span.className = `badge ${badgeClassForType(type)}`;
    span.textContent = type.replaceAll("_", " ");
    return span;
}

function typeBadge(type) {
    const cls = badgeClassForType(type);
    return `<span class="badge ${cls}">${escapeHtml(type.replaceAll("_", " "))}</span>`;
}

function openEventModal(isoDate, events) {
    const modalTitle = document.getElementById("eventModalTitle");
    const modalBody = document.getElementById("eventModalBody");

    modalTitle.textContent = `Events — ${isoDate}`;

    modalBody.innerHTML = events.map(ev => `
      <div class="mb-3 p-3 border rounded">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <div class="fw-semibold">${escapeHtml(ev.title)}</div>
            <div class="small" style="opacity:0.8;">
              ${escapeHtml(ev.time_utc)} UTC${ev.source ? ` • ${escapeHtml(ev.source)}` : ""}
            </div>
          </div>
          <div>${typeBadge(ev.type)}</div>
        </div>

        <div class="mt-2">
          ${escapeHtml(ev.description ?? "")}
        </div>

        ${ev.details ? `
          <hr class="my-2" />
          <div class="small">
            ${Object.entries(ev.details).map(([k, v]) =>
        `<div><span style="opacity:0.75;">${escapeHtml(k.replaceAll("_", " "))}:</span> ${escapeHtml(v)}</div>`
    ).join("")}
          </div>
        ` : ""}
      </div>
    `).join("");

    const modalEl = document.getElementById("eventModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}
