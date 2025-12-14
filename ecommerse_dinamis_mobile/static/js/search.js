document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    searchInput.addEventListener("keyup", () => {
        const keyword = searchInput.value.toLowerCase();

        document.querySelectorAll(".product-card").forEach(card => {
            const namaEl = card.querySelector("small");
            if (!namaEl) return;

            const nama = namaEl.innerText.toLowerCase();
            card.parentElement.style.display = nama.includes(keyword) ? "block" : "none";
        });
    });
});
