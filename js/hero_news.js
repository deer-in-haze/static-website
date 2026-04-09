// hero_news.js — fetches space_news.json and renders the latest headlines in the hero section

(() => {
    const listEl = document.getElementById("hero-news-list");
    if (!listEl) return;

    const esc = window.helper.escapeHtml;
    const resolveUrl = (path) => new URL(path, document.baseURI).href;

    async function load() {
        try {
            const res = await fetch(resolveUrl("data/space_news.json"), { cache: "no-store" });
            if (!res.ok) throw new Error("news json not found");

            const { items } = await res.json();
            if (!Array.isArray(items) || items.length === 0) {
                listEl.textContent = "No news yet.";
                return;
            }

            listEl.innerHTML = items
                .slice(0, 5)
                .map((n) => `
                    <a class="hero-news-item" href="${n.url}" target="_blank" rel="noopener">
                        <div class="hero-news-item-title">${esc(n.title)}</div>
                        <div class="hero-news-item-meta">${esc(n.source)} • ${esc(n.published_at)}</div>
                    </a>
                `)
                .join("");
        } catch (e) {
            console.error(e);
            listEl.textContent = "Could not load news.";
        }
    }

    load();
})();
