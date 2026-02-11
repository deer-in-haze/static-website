// calendar_event_modal.js
(() => {
    const h = window.helpers;
    const esc = h.escapeHtml;
    const typeLabel = h.typeLabel;

    function typeBadge(type) {
        const t = String(type ?? "");
        return `<span class="calendar-event-badge calendar-event-badge--${esc(t)}">${esc(typeLabel(t))}</span>`;
    }

    function detailsHtml(details) {
        if (!details) return "";
        const rows = Object.entries(details)
            .map(([k, v]) => `
        <div class="calendar-event-detail-row">
          <span class="calendar-event-detail-key">${esc(String(k).replaceAll("_", " "))}:</span>
          <span class="calendar-event-detail-val">${esc(v)}</span>
        </div>
      `)
            .join("");

        return `
      <div class="calendar-event-divider"></div>
      <div class="calendar-event-details">${rows}</div>
    `;
    }

    function openEventModal(isoDate, events) {
        const modalTitle = document.getElementById("eventModalTitle");
        const modalBody = document.getElementById("eventModalBody");
        const modalEl = document.getElementById("eventModal");

        if (!modalTitle || !modalBody || !modalEl) return;

        modalTitle.textContent = `Events — ${isoDate}`;

        modalBody.innerHTML = (events ?? [])
            .map((ev) => `
        <div class="calendar-event-card">
          <div class="calendar-event-card-top">
            <div class="calendar-event-card-main">
              <div class="calendar-event-title">${esc(ev.title)}</div>
              <div class="calendar-event-meta">
                ${esc(ev.time_utc)}${ev.time_utc ? " UTC" : ""}${ev.source ? ` • ${esc(ev.source)}` : ""}
              </div>
            </div>

            <div class="calendar-event-card-actions">
              ${typeBadge(ev.type)}
              <a class="add-to-google-calendar-btn"
                 target="_blank" rel="noopener"
                 href="${window.googleCalendarUrlForEvent(isoDate, ev)}">
                Add to Google Calendar
              </a>
            </div>
          </div>

          <div class="calendar-event-description">${esc(ev.description ?? "")}</div>
          ${detailsHtml(ev.details)}
        </div>
      `)
            .join("");

        bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }

    window.openEventModal = openEventModal;
})();
