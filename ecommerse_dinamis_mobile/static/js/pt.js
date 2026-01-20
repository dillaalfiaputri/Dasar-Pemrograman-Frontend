document.addEventListener("DOMContentLoaded", async () => {
    const listPT = document.getElementById("list-pt");
    const kategoriWrapper = document.getElementById("kategori-wrapper");

    const res = await fetch("/api/pt");
    const pts = await res.json();

    pts.forEach(pt => {
        listPT.innerHTML += `
          <div class="col-4 pt-btn" data-pt="${pt}">
            <div class="product-card text-center shadow-sm p-2">
              🏭<br/>
              <small>${pt}</small>
            </div>
          </div>
        `;
    });

    document.querySelectorAll(".pt-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const pt = btn.dataset.pt;

            // tampilkan kategori
            kategoriWrapper.style.display = "block";

            // load kategori milik PT
            const resKat = await fetch(`/api/kategori?pt=${pt}`);
            const kategori = await resKat.json();

            renderKategori(kategori, pt);
        });
    });
});

async function loadProdukPT(pt) {
    const res = await fetch(`/api/produk/filter?pt=${pt}`);
    const data = await res.json();
    renderProdukKategori(data);
}
