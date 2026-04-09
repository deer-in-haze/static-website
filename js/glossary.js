// glossary.js — renders astronomy terms and handles live search + category filtering

(() => {
    const TERMS = [
        // Orbital mechanics
        { term: "Aphelion",       category: "orbital",     definition: "The point in a planet's orbit where it is farthest from the Sun." },
        { term: "Perihelion",     category: "orbital",     definition: "The point in a planet's orbit where it is closest to the Sun." },
        { term: "Apogee",         category: "orbital",     definition: "The point in the Moon's (or a satellite's) orbit farthest from Earth." },
        { term: "Perigee",        category: "orbital",     definition: "The point in the Moon's (or a satellite's) orbit closest to Earth." },
        { term: "Conjunction",    category: "orbital",     definition: "When two celestial bodies appear closest together in the sky as seen from Earth." },
        { term: "Opposition",     category: "orbital",     definition: "When a planet is directly opposite the Sun as seen from Earth, making it fully illuminated and closest to us." },
        { term: "Transit",        category: "orbital",     definition: "When a smaller celestial body passes across the face of a larger one, such as Mercury crossing the Sun." },
        { term: "Occultation",    category: "orbital",     definition: "When one celestial body is hidden behind another, such as the Moon passing in front of a star." },
        { term: "Syzygy",         category: "orbital",     definition: "The alignment of three or more celestial bodies in a straight line, as during an eclipse or full moon." },

        // Celestial navigation
        { term: "Ecliptic",       category: "navigation",  definition: "The apparent path of the Sun across the celestial sphere over the course of a year." },
        { term: "Equinox",        category: "navigation",  definition: "The two moments each year (around March 20 and September 22) when day and night are of equal length worldwide." },
        { term: "Solstice",       category: "navigation",  definition: "The two moments each year when the Sun reaches its highest or lowest point in the sky, giving the longest and shortest days." },
        { term: "Zenith",         category: "navigation",  definition: "The point in the sky directly above the observer." },
        { term: "Meridian",       category: "navigation",  definition: "An imaginary north–south line passing through the zenith, used as a reference for measuring time and position." },
        { term: "Right Ascension",category: "navigation",  definition: "The celestial equivalent of longitude, measuring east–west position on the celestial sphere in hours, minutes, and seconds." },
        { term: "Declination",    category: "navigation",  definition: "The celestial equivalent of latitude, measuring north–south position on the celestial sphere in degrees." },

        // Measurement
        { term: "Astronomical Unit", category: "measurement", definition: "The average distance between Earth and the Sun, approximately 149.6 million kilometres. Used to measure distances within the Solar System." },
        { term: "Light-year",     category: "measurement", definition: "The distance light travels in one year, approximately 9.46 trillion kilometres. Used for interstellar distances." },
        { term: "Parsec",         category: "measurement", definition: "A unit of distance equal to about 3.26 light-years, derived from the angle of parallax of one arcsecond." },
        { term: "Magnitude",      category: "measurement", definition: "A logarithmic scale measuring the brightness of a celestial object. Lower numbers are brighter; negative numbers indicate very bright objects." },
        { term: "Albedo",         category: "measurement", definition: "The fraction of incoming sunlight a surface reflects, ranging from 0 (total absorption) to 1 (total reflection)." },
        { term: "Parallax",       category: "measurement", definition: "The apparent shift in position of a nearby star against background stars when viewed from opposite sides of Earth's orbit, used to measure stellar distances." },

        // Physics & phenomena
        { term: "Redshift",       category: "physics",     definition: "The stretching of light to longer (redder) wavelengths, indicating an object is moving away from the observer. Used as evidence for the expanding universe." },
        { term: "Blueshift",      category: "physics",     definition: "The compression of light to shorter (bluer) wavelengths, indicating an object is moving toward the observer." },
        { term: "Event Horizon",  category: "physics",     definition: "The boundary surrounding a black hole beyond which nothing — not even light — can escape its gravitational pull." },
        { term: "Accretion Disk", category: "physics",     definition: "A disk of gas, dust, and other material spiralling inward around a black hole or forming star, heated to extreme temperatures by friction." },

        // Objects
        { term: "Nebula",         category: "objects",     definition: "A vast cloud of gas and dust in space; the birthplace of stars and often the remnant of a stellar explosion." },
        { term: "Supernova",      category: "objects",     definition: "A catastrophic explosion marking the death of a massive star, briefly outshining entire galaxies and scattering heavy elements into space." },
        { term: "Pulsar",         category: "objects",     definition: "A rapidly rotating neutron star that emits beams of electromagnetic radiation, observed as regular pulses." },
        { term: "Quasar",         category: "objects",     definition: "An extremely luminous active galactic nucleus powered by a supermassive black hole, visible across billions of light-years." },
        { term: "Meteor",         category: "objects",     definition: "A space rock that burns up upon entering Earth's atmosphere, visible as a streak of light (shooting star)." },
        { term: "Meteorite",      category: "objects",     definition: "A meteor that survives its passage through the atmosphere and lands on Earth's surface." },
        { term: "Comet",          category: "objects",     definition: "An icy body that develops a bright coma and tail of gas and dust when it passes close to the Sun." },
        { term: "Kuiper Belt",    category: "objects",     definition: "A region of the Solar System beyond Neptune's orbit, containing many small icy bodies including Pluto." },
        { term: "Oort Cloud",     category: "objects",     definition: "A vast, distant spherical shell of icy bodies surrounding the Solar System, thought to be the source of long-period comets." },
    ];

    const CATEGORY_LABELS = {
        all:         "All",
        orbital:     "Orbital",
        navigation:  "Navigation",
        measurement: "Measurement",
        physics:     "Physics",
        objects:     "Objects",
    };

    const gridEl       = document.getElementById("glossary-grid");
    const searchEl     = document.getElementById("glossary-search");
    const filterBtns   = document.querySelectorAll("[data-category]");
    const countEl      = document.getElementById("glossary-count");

    if (!gridEl || !searchEl) return;

    let activeCategory = "all";
    let searchQuery    = "";

    // ── Rendering ─────────────────────────────────────────────────────────────

    function render() {
        const query = searchQuery.toLowerCase();

        const visible = TERMS.filter((t) => {
            const matchesSearch   = t.term.toLowerCase().includes(query) ||
                                    t.definition.toLowerCase().includes(query);
            const matchesCategory = activeCategory === "all" || t.category === activeCategory;
            return matchesSearch && matchesCategory;
        });

        if (countEl) countEl.textContent = `${visible.length} term${visible.length !== 1 ? "s" : ""}`;

        if (visible.length === 0) {
            gridEl.innerHTML = `<p class="glossary-empty">No terms match your search.</p>`;
            return;
        }

        gridEl.innerHTML = visible
            .map((t) => `
                <article class="glossary-card">
                    <div class="glossary-card-header">
                        <h3 class="glossary-term">${window.helper.escapeHtml(t.term)}</h3>
                        <span class="glossary-badge glossary-badge--${t.category}">
                            ${CATEGORY_LABELS[t.category] ?? t.category}
                        </span>
                    </div>
                    <p class="glossary-definition">${window.helper.escapeHtml(t.definition)}</p>
                </article>
            `)
            .join("");
    }

    // ── Events ────────────────────────────────────────────────────────────────

    // Live search — filters as the user types
    searchEl.addEventListener("input", () => {
        searchQuery = searchEl.value;
        render();
    });

    // Category filter buttons — highlights the active one and re-renders
    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            activeCategory = btn.dataset.category;
            render();
        });
    });

    // Initial render — show all terms on page load
    render();
})();
