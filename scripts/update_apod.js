const fs = require("fs");
const path = require("path");

const API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";
const DAYS = 7;

const outImgDir = path.join(process.cwd(), "images", "apod");
const outJson = path.join(process.cwd(), "data", "apod_last7.json");

function pad2(n) {
    return String(n).padStart(2, "0");
}

function toIso(d) {
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function extFromContentType(ct) {
    if (!ct) return ".jpg";
    const t = ct.split(";")[0].trim().toLowerCase();
    if (t === "image/jpeg") return ".jpg";
    if (t === "image/png") return ".png";
    if (t === "image/webp") return ".webp";
    if (t === "image/gif") return ".gif";
    return ".jpg";
}

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch failed ${res.status}: ${url}`);
    return res.json();
}

async function downloadToFile(url, filepath) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`download failed ${res.status}: ${url}`);

    const ct = res.headers.get("content-type");
    const ext = extFromContentType(ct);

    // Ensure filepath uses correct extension
    const finalPath = filepath.replace(/\.[a-z0-9]+$/i, ext);

    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(finalPath, buf);
    return { finalPath, contentType: ct };
}

(async () => {
    fs.mkdirSync(outImgDir, { recursive: true });
    fs.mkdirSync(path.dirname(outJson), { recursive: true });

    const end = new Date();
    const start = new Date(end.getTime());
    start.setUTCDate(end.getUTCDate() - (DAYS - 1));

    const startIso = toIso(start);
    const endIso = toIso(end);

    const apiUrl =
        `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(API_KEY)}` +
        `&start_date=${encodeURIComponent(startIso)}` +
        `&end_date=${encodeURIComponent(endIso)}` +
        `&thumbs=true`;

    const data = await fetchJson(apiUrl);
    const items = (Array.isArray(data) ? data : [data])
        .filter(Boolean)
        .sort((a, b) => (a.date > b.date ? 1 : -1)); // oldest -> newest

    // We'll write 1..7 oldest->newest (1 = oldest, 7 = newest)
    const manifest = [];

    // Clear old files 1..7.* so extension changes won't leave leftovers
    for (let i = 1; i <= DAYS; i++) {
        for (const ext of [".jpg", ".png", ".webp", ".gif"]) {
            const p = path.join(outImgDir, `${i}${ext}`);
            if (fs.existsSync(p)) fs.unlinkSync(p);
        }
    }

    for (let i = 0; i < Math.min(DAYS, items.length); i++) {
        const apod = items[i];

        const mediaUrl =
            apod.media_type === "image"
                ? apod.url
                : (apod.thumbnail_url || apod.url); // video -> thumbnail if provided

        const base = path.join(outImgDir, `${i + 1}.jpg`); // extension may be replaced

        const { finalPath } = await downloadToFile(mediaUrl, base);

        const relImgPath = `images/apod/${path.basename(finalPath)}`;

        manifest.push({
            slot: i + 1,
            date: apod.date,
            title: apod.title,
            explanation: apod.explanation,
            media_type: apod.media_type,
            apod_url: apod.url,
            hdurl: apod.hdurl || null,
            image_path: relImgPath
        });

        console.log(`Saved slot ${i + 1}: ${relImgPath} (${apod.media_type})`);
    }

    fs.writeFileSync(outJson, JSON.stringify({ updated: endIso, items: manifest }, null, 2));
    console.log(`Wrote ${outJson}`);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
