// helper.js — shared utilities exported to window.helper

(() => {
    const MOON_CACHE_KEY = "moon_phase_cache_v1";

    function escapeHtml(s) {
        return String(s ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function typeLabel(type) {
        return String(type ?? "").replaceAll("_", " ");
    }

    function nextLocalMidnightMs() {
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        return midnight.getTime();
    }

    function readMoonCache() {
        try {
            const raw = localStorage.getItem(MOON_CACHE_KEY);
            if (!raw) return null;

            const cached = JSON.parse(raw);
            if (!cached?.expires_at || Date.now() > cached.expires_at) {
                localStorage.removeItem(MOON_CACHE_KEY);
                return null;
            }

            return cached.value ?? null;
        } catch {
            return null;
        }
    }

    function writeMoonCache(value) {
        try {
            localStorage.setItem(
                MOON_CACHE_KEY,
                JSON.stringify({ expires_at: nextLocalMidnightMs(), value })
            );
        } catch {
            // localStorage unavailable (e.g. private browsing) — skip caching
        }
    }

    window.helper = { escapeHtml, typeLabel, readMoonCache, writeMoonCache };
})();
