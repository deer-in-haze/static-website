// apod_card.js — loads the last 7 NASA APOD entries and runs an auto-rotating slideshow

(() => {
    const DATA_URL = "data/apod_last7.json";

    // DOM references
    const imgEl   = document.getElementById("apod-img");
    const titleEl = document.getElementById("apod-title");
    const textEl  = document.getElementById("apod-text");
    const dateEl  = document.getElementById("apod-date");
    const linkEl  = document.getElementById("apod-link");
    const prevBtn = document.getElementById("apod-prev");
    const nextBtn = document.getElementById("apod-next");
    const cardEl  = document.getElementById("apod-card");

    if (!imgEl || !titleEl || !textEl || !dateEl || !linkEl || !prevBtn || !nextBtn) return;

    imgEl.addEventListener("error", () => {
        console.error("APOD image failed to load:", imgEl.src);
    });

    let items = [];
    let index = 0;
    let timer = null;

    // Resolves a possibly-relative path against the page's base URI
    const resolveUrl = (maybeRelative) => {
        try {
            return new URL(String(maybeRelative || ""), document.baseURI).href;
        } catch {
            return "";
        }
    };

    // ── State helpers ──────────────────────────────────────────────────────────

    function setLoading(msg) {
        textEl.textContent = msg;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }

    function setReady() {
        prevBtn.disabled = items.length <= 1;
        nextBtn.disabled = items.length <= 1;
    }

    // ── Rendering ─────────────────────────────────────────────────────────────

    function show(i) {
        if (!items.length) return;

        index = (i + items.length) % items.length;
        const apod = items[index] || {};

        const imgUrl = resolveUrl(apod.image_path || apod.image);
        if (!imgUrl) {
            setLoading("Missing image path in APOD data.");
            return;
        }

        imgEl.src = imgUrl;
        imgEl.alt = apod.title || "NASA APOD";

        titleEl.textContent = apod.title || "NASA APOD";
        dateEl.textContent  = apod.date  || "";

        // Truncate long explanations to keep the card compact
        const expl = apod.explanation || "";
        textEl.textContent = expl.length > 140 ? expl.slice(0, 140) + "…" : expl;

        linkEl.href = apod.apod_url || apod.hdurl || "#";

        setReady();
    }

    // ── Auto-rotation ─────────────────────────────────────────────────────────

    function startAutoRotate() {
        stopAutoRotate();
        timer = setInterval(() => show(index + 1), 6000);
    }

    function stopAutoRotate() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    // ── Data loading ──────────────────────────────────────────────────────────

    async function loadLocalApod() {
        try {
            setLoading("Loading NASA APOD…");

            const res = await fetch(resolveUrl(DATA_URL), { cache: "no-store" });
            if (!res.ok) throw new Error(`Failed to load APOD data (${res.status})`);

            const json = await res.json();
            items = Array.isArray(json.items) ? json.items : [];

            if (!items.length) {
                setLoading("No APOD items found.");
                return;
            }

            show(items.length - 1); // start on the most recent entry
            startAutoRotate();
        } catch (e) {
            console.error("APOD slideshow error:", e);
            setLoading("Could not load APOD data.");
        }
    }

    // ── Events ────────────────────────────────────────────────────────────────

    // Manual prev/next — resets the auto-rotation timer on each click
    prevBtn.addEventListener("click", () => { stopAutoRotate(); show(index - 1); startAutoRotate(); });
    nextBtn.addEventListener("click", () => { stopAutoRotate(); show(index + 1); startAutoRotate(); });

    // Pause rotation while the user hovers over the card
    if (cardEl) {
        cardEl.addEventListener("mouseenter", stopAutoRotate);
        cardEl.addEventListener("mouseleave", startAutoRotate);
    }

    loadLocalApod();
})();
