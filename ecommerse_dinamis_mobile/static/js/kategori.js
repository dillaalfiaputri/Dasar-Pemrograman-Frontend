document.addEventListener("DOMContentLoaded", () => {
    const kategoriBtns = document.querySelectorAll(".kategori-btn");
    const produkRekom = document.getElementById("produk-rekomendasi");
    const produkKategori = document.getElementById("produk-kategori");
    const judul = document.getElementById("judul-kategori");

    // ⛔ JIKA BUKAN HALAMAN INDEX → STOP
    if (!kategoriBtns.length || !produkRekom || !produkKategori || !judul) return;

    kategoriBtns.forEach(btn => {
        btn.addEventListener("click", async () => {
            const kategori = btn.dataset.kategori;
            const res = await fetch(`/api/produk?kategori=${kategori}`);
            const data = await res.json();

            judul.innerText = "Kategori: " + kategori;
            produkRekom.style.display = "none";
            produkKategori.style.display = "block";

            renderProdukKategori(data);
        });
    });
});
