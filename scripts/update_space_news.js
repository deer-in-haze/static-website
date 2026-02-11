// scripts/update_space_news.js
const fs = require("fs");
const path = require("path");

const OUT = path.join(process.cwd(), "data", "space_news.json");

// SNAPI v4 docs: https://api.spaceflightnewsapi.net/v4/docs/  (articles endpoint)
const SNAPI_URL = "https://api.spaceflightnewsapi.net/v4/articles/?limit=8";

(async () => {
    const res = await fetch(SNAPI_URL);
    if (!res.ok) throw new Error(`SNAPI failed: ${res.status}`);

    const json = await res.json();

    // v4 returns { count, next, previous, results: [...] }
    const results = Array.isArray(json.results) ? json.results : [];

    const items = results.map((a) => ({
        id: a.id,
        title: a.title,
        url: a.url,
        image_url: a.image_url,
        source: a.news_site,
        published_at: (a.published_at || "").slice(0, 10),
    }));

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), items }, null, 2));
    console.log("Wrote", OUT);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
