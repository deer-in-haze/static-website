(() => {
    const DATA_URL = "data/apod_last7.json";

    const imgEl = document.getElementById("apod-img");
    const titleEl = document.getElementById("apod-title");
    const textEl = document.getElementById("apod-text");
    const dateEl = document.getElementById("apod-date");
    const linkEl = document.getElementById("apod-link");
    const prevBtn = document.getElementById("apod-prev");
    const nextBtn = document.getElementById("apod-next");
    const cardEl = document.getElementById("apod-card");

    if (!imgEl || !titleEl || !textEl || !dateEl || !linkEl || !prevBtn || !nextBtn) return;

    imgEl.addEventListener("error", () => {
        console.error("APOD image failed to load:", imgEl.src);
    });

    let items = [];
    let index = 0;
    let timer = null;

    const resolveUrl = (maybeRelative) => {
        try {
            return new URL(String(maybeRelative || ""), document.baseURI).href;
        } catch {
            return "";
        }
    };

    function setLoading(msg) {
        textEl.textContent = msg;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }

    function setReady() {
        prevBtn.disabled = items.length <= 1;
        nextBtn.disabled = items.length <= 1;
    }

    function show(i) {
        if (!items.length) return;

        index = (i + items.length) % items.length;
        const apod = items[index] || {};

        const imgPath = apod.image_path || apod.image;
        const imgUrl = resolveUrl(imgPath);

        if (!imgUrl) {
            setLoading("Missing image path in APOD data.");
            return;
        }

        imgEl.src = imgUrl;
        imgEl.alt = apod.title || "NASA APOD";

        titleEl.textContent = apod.title || "NASA APOD";
        dateEl.textContent = apod.date || "";

        const expl = apod.explanation || "";
        textEl.textContent = expl.length > 140 ? expl.slice(0, 140) + "…" : expl;

        linkEl.href = apod.apod_url || apod.hdurl || "#";

        setReady();
    }

    function startAutoRotate() {
        stopAutoRotate();
        timer = setInterval(() => show(index + 1), 6000);
    }

    function stopAutoRotate() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    async function loadLocalApod() {
        try {
            setLoading("Loading NASA APOD…");

            const jsonUrl = resolveUrl(DATA_URL);
            const res = await fetch(jsonUrl, { cache: "no-store" });
            if (!res.ok) throw new Error(`Failed to load ${jsonUrl}`);

            const json = await res.json();
            items = Array.isArray(json.items) ? json.items : [];

            if (!items.length) {
                setLoading("No APOD items found.");
                return;
            }

            show(items.length - 1);
            startAutoRotate();
        } catch (e) {
            console.error("APOD local slideshow error:", e);
            setLoading("Could not load APOD data.");
        }
    }

    prevBtn.addEventListener("click", () => {
        stopAutoRotate();
        show(index - 1);
        startAutoRotate();
    });

    nextBtn.addEventListener("click", () => {
        stopAutoRotate();
        show(index + 1);
        startAutoRotate();
    });

    if (cardEl) {
        cardEl.addEventListener("mouseenter", stopAutoRotate);
        cardEl.addEventListener("mouseleave", startAutoRotate);
    }

    loadLocalApod();
})();
