function update_moon_card({ phase, illumination }) {
    const moon_image = document.getElementById("moonphase-img");
    const title = document.getElementById("moonphase-title");
    const text = document.getElementById("moonphase-text");

    if (title) title.textContent = "Current Moon phase";
    if (text) {
        text.textContent = `${phase || "Unknown"}${illumination != null ? ` • ${illumination}% illuminated` : ""}`;
    }

    if (moon_image) {
        moon_image.src = match_phase_to_moon_image(phase);
        moon_image.alt = phase ? `Moon phase: ${phase}` : "Moon phase";
    }
}

async function load_moon_phase() {
    let coordinates = default_coords;

    try {
        coordinates = await get_user_location();
    } catch (_) {
        console.warn(`Could not get user coordinates. Using default (Vilnius)`);
    }

    try {
        const url = build_usno_url(coordinates);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`request to get moon data from USNO failed: ${response.status}`);

        const data = await response.json();
        const phase = data?.properties?.data?.curphase ?? null;
        const fracillum = data?.properties?.data?.fracillum;
        const illumination = typeof fracillum === "number" ? Math.round(fracillum * 100) : null;

        update_moon_card({ phase, illumination: illumination });
    } catch (error) {
        console.error(error);
        update_moon_card({ phase: "Unavailable", illumination: null });
    }
}

function match_phase_to_moon_image(phase) {
    if (!phase) return "images/moon_phases/new_moon.png";

    phase = phase.toLowerCase();

    if (phase.includes("new")) return "images/moon_phases/new_moon.png";
    if (phase.includes("waxing crescent")) return "images/moon_phases/waxing_crescent.png";
    if (phase.includes("first quarter")) return "images/moon_phases/first_quarter.png";
    if (phase.includes("waxing gibbous")) return "images/moon_phases/waxing_gibbous.png";
    if (phase.includes("full")) return "images/moon_phases/full_moon.png";
    if (phase.includes("waning gibbous")) return "images/moon_phases/waning_gibbous.png";
    if (phase.includes("third quarter")) return "images/moon_phases/last_quarter.png";
    if (phase.includes("waning crescent")) return "images/moon_phases/waning_crescent.png";

    return "images/moon_phases/new_moon.png";
}

document.addEventListener("DOMContentLoaded", load_moon_phase);