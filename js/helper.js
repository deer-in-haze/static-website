(() => {

    const escapeHtml = s =>
        String(s ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    const typeLabel = type =>
        String(type ?? "").replaceAll("_", " ");

    window.helper = { escapeHtml, typeLabel };

})();
