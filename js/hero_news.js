// js/hero_news.js
(() => {
    const listEl = document.getElementById("hero-news-list");
    if (!listEl) return;

    const resolveUrl = (p) => new URL(p, document.baseURI).href;

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
                .map(
                    (n) => `
          <a class="hero-news-item" href="${n.url}" target="_blank" rel="noopener">
            <div class="hero-news-item-title">${escapeHtml(n.title)}</div>
            <div class="hero-news-item-meta">${escapeHtml(n.source)} • ${escapeHtml(n.published_at)}</div>
          </a>
        `
                )
                .join("");
        } catch (e) {
            console.error(e);
            listEl.textContent = "Could not load news.";
        }
    }

    function escapeHtml(s) {
        return String(s ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    load();
})();
