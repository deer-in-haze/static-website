// moon_card.js — fetches today's moon phase from the USNO API and renders the moon card

(() => {
    const MOON_PHASE_IMAGES = {
        "new":              "images/moon_phases/new_moon.png",
        "waxing crescent":  "images/moon_phases/waxing_crescent.png",
        "first quarter":    "images/moon_phases/first_quarter.png",
        "waxing gibbous":   "images/moon_phases/waxing_gibbous.png",
        "full":             "images/moon_phases/full_moon.png",
        "waning gibbous":   "images/moon_phases/waning_gibbous.png",
        "third quarter":    "images/moon_phases/last_quarter.png",
        "waning crescent":  "images/moon_phases/waning_crescent.png",
    };

    function phaseImage(phase) {
        if (!phase) return MOON_PHASE_IMAGES["new"];
        const lower = phase.toLowerCase();
        const key = Object.keys(MOON_PHASE_IMAGES).find((k) => lower.includes(k));
        return key ? MOON_PHASE_IMAGES[key] : MOON_PHASE_IMAGES["new"];
    }

    function phenTime(moondata, target) {
        if (!Array.isArray(moondata)) return null;
        const entry = moondata.find((e) => (e?.phen ?? "").toLowerCase() === target);
        return entry?.time ?? null;
    }

    function renderCard({ phase, illumination, rise, transit, set, closestPhase }) {
        const imgEl     = document.getElementById("moonphase-img");
        const titleEl   = document.getElementById("moonphase-title");
        const textEl    = document.getElementById("moonphase-text");
        const detailsEl = document.getElementById("moonphase-details");

        if (titleEl) titleEl.textContent = "Current Moon phase";

        if (textEl) {
            const illumStr = illumination != null ? ` • ${illumination}% illuminated` : "";
            textEl.textContent = `${phase || "Unknown"}${illumStr}`;
        }

        if (detailsEl) {
            const fmt = (t) => t ?? "—";
            detailsEl.innerHTML = `
                <li><strong>Moonrise:</strong> ${fmt(rise)}</li>
                <li><strong>Transit:</strong> ${fmt(transit)}</li>
                <li><strong>Moonset:</strong> ${fmt(set)}</li>
                ${closestPhase ? `<li class="mt-2"><strong>Closest phase:</strong> ${closestPhase}</li>` : ""}
            `;
        }

        if (imgEl) {
            imgEl.src = phaseImage(phase);
            imgEl.alt = phase ? `Moon phase: ${phase}` : "Moon phase";
        }
    }

    async function load() {
        const cached = helper.readMoonCache();
        if (cached) {
            renderCard(cached);
            return;
        }

        let coordinates = default_coords;
        try {
            coordinates = await get_user_location();
        } catch {
            console.warn("Geolocation unavailable — using default coordinates (Vilnius).");
        }

        try {
            const res = await fetch(build_usno_url(coordinates));
            if (!res.ok) throw new Error(`USNO request failed: ${res.status}`);

            const block = (await res.json())?.properties?.data ?? {};

            const phase        = block.curphase ?? null;
            const illumination = block.fracillum != null
                ? parseInt(String(block.fracillum).replace("%", ""), 10)
                : null;
            const moondata     = block.moondata ?? [];
            const rise         = phenTime(moondata, "rise");
            const transit      = phenTime(moondata, "upper transit");
            const set          = phenTime(moondata, "set");
            const cp           = block.closestphase;
            const closestPhase = cp
                ? `${cp.phase} • ${block.year}-${cp.month}-${cp.day} ${cp.time}`
                : null;

            const value = { phase, illumination, rise, transit, set, closestPhase };

            helper.writeMoonCache(value);
            renderCard(value);
        } catch (err) {
            console.error(err);
            renderCard({ phase: "Unavailable", illumination: null, rise: null, transit: null, set: null, closestPhase: null });
        }
    }

    document.addEventListener("DOMContentLoaded", load);
})();
