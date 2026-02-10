console.log("JS loaded");

fetch("./partials/navbar.html")
    .then(r => r.text())
    .then(html => {
        document.getElementById("navbar").innerHTML = html;
    });

fetch("./partials/footer.html")
    .then(r => r.text())
    .then(html => {
        document.getElementById("footer").innerHTML = html;
    });