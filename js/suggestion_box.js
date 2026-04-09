// suggestion_box.js — handles suggestion form submission and shows a success message

(() => {
    const form       = document.getElementById("suggestion-form");
    const successMsg = document.getElementById("suggestion-success");

    if (!form || !successMsg) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault(); // prevent actual page reload (no backend)

        form.style.display = "none";
        successMsg.style.display = "block";
    });
})();
