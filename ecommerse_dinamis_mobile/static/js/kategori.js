const kategoriIcon = {
    "suplemen": "💊",
    "bronkodilator": "🫁",
    "lambung": "🍽️",
    "antiemetik": "🤢",
    "antidiabetes": "🩸",
    "obat Alergi": "🤧",
    "antidiare": "🚽",
    "obat Demam": "🌡️",
    "antijamur": "🍄",
    "analgesik": "😣",
    "kortikosteroid": "💉",
    "antibiotik": "🦠"
};

function renderKategori(data, pt) {
    const container = document.getElementById("list-kategori");
    container.innerHTML = "";

    data.forEach(kat => {
        // ambil ikon sesuai kategori (fallback 💊)
        const icon = kategoriIcon[kat.toLowerCase()] || "💊";

        container.innerHTML += `
          <div class="col-3 kategori-btn" data-kategori="${kat}" data-pt="${pt}">
            <div class="cat-icon">${icon}</div>
            <small>${kat}</small>
          </div>
        `;
    });
}



document.addEventListener("click", async e => {
    const btn = e.target.closest(".kategori-btn");
    if (!btn) return;

    const kategori = btn.dataset.kategori;
    const pt = btn.dataset.pt;

    // ⛔ SAFETY CHECK
    if (!pt || !kategori) return;

    const res = await fetch(
        `/api/produk/filter?pt=${encodeURIComponent(pt)}&kategori=${encodeURIComponent(kategori)}`
    );
    const data = await res.json();

    document.getElementById("produk-rekomendasi").style.display = "none";
    document.getElementById("produk-kategori").style.display = "block";

    renderProdukKategori(data);
});

