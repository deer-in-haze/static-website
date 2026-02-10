function renderCalendar(year, monthIndex) {
    // monthIndex: 0 = January, 11 = December

    const grid = document.getElementById("calendarGrid");
    const title = document.getElementById("monthTitle");

    // Reset
    grid.innerHTML = "";

    const monthName = new Date(year, monthIndex)
        .toLocaleString("default", { month: "long" });

    title.textContent = `${monthName} ${year}`;

    const firstDate = new Date(year, monthIndex, 1);

    // Convert JS day (Sun=0) → Monday=0
    const mondayIndex = (firstDate.getDay() + 6) % 7;

    const daysInMonth =
        new Date(year, monthIndex + 1, 0).getDate();

    // Leading empty cells
    for (let i = 0; i < mondayIndex; i++) {
        grid.appendChild(createEmptyCell());
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        grid.appendChild(createDayCell(day));
    }

    // Trailing empty cells
    const totalCells = mondayIndex + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;

    for (let i = 0; i < remaining; i++) {
        grid.appendChild(createEmptyCell());
    }
}


function createDayCell(day) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.textContent = day;
    return cell;
}

function createEmptyCell() {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.style.visibility = "hidden";
    return cell;
}

renderCalendar(2026, 0); // January 2026
