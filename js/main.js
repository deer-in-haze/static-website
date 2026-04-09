// main.js — loads shared partials (navbar, calendar, footer) then boots the calendar

function getBasePath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts.length > 0 ? `/${parts[0]}` : "";
}

const base = getBasePath();

async function loadPartial(id, pathFromBase) {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`element #${id} not found`);
        return;
    }

    const url = `${base}${pathFromBase}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`failed to load ${url} (${res.status})`);

    el.innerHTML = await res.text();
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadPartial("navbar", "/partials/navbar.html");
        await loadPartial("calendar", "/partials/calendar.html");
        await loadPartial("footer", "/partials/footer.html");

        if (typeof init_calendar === "function") {
            init_calendar();
        } else {
            console.warn("init_calendar() not found");
        }
    } catch (err) {
        console.error(err);
    }
});
