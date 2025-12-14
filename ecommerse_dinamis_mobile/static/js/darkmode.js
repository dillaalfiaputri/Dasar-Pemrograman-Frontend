document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const toggle = document.getElementById("darkModeToggle");

    // ✅ AKTIFKAN DARK MODE DARI LOCALSTORAGE (TANPA SYARAT TOMBOL)
    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("dark-mode");
        if (toggle) toggle.innerHTML = "☀️";
    }

    // kalau tidak ada toggle, cukup sampai sini
    if (!toggle) return;

    toggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        const enabled = body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", enabled ? "enabled" : "disabled");
        toggle.innerHTML = enabled ? "☀️" : "🌙";
    });
});
