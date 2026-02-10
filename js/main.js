console.log("JS loaded");

function loadPartial(id, path) {
    return fetch(path)
        .then(r => {
            if (!r.ok) throw new Error(`failed to load ${path}`);
            return r.text();
        })
        .then(html => {
            document.getElementById(id).innerHTML = html;
        });
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadPartial("navbar", "./partials/navbar.html");
    await loadPartial("calendar", "./partials/calendar.html");
    await loadPartial("footer", "./partials/footer.html");

    if (typeof init_calendar === "function") {
        init_calendar();
    } else {
        console.warn("init_calendar() not found");
    }
});
