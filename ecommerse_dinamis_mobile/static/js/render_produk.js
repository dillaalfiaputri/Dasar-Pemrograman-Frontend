function renderProdukKategori(list) {
    const produkKategori = document.getElementById("produk-kategori");
    const isAdmin = document.body.dataset.role === "admin";

    produkKategori.innerHTML = "";

    if (list.length === 0) {
        produkKategori.innerHTML = "<p class='text-center'>Tidak ada produk.</p>";
        return;
    }

    let html = `<div class="row g-3">`;

    list.forEach(p => {
        html += `
        <div class="col-6">
            <div class="product-card shadow-sm">
                <img src="/static/${p.gambar}" class="w-100">
                <small class="fw-semibold d-block">${p.nama}</small>
                <small class="text-primary fw-bold fs-6">
                    Rp ${p.harga.toLocaleString()}
                </small>
                <small>Terjual ${p.terjual}</small>
                <a href="/product/${p._id}" class="btn btn-sm btn-outline-primary mt-1 w-100">Detail</a>

                ${isAdmin ? `
                <a href="/produk/edit/${p._id}" class="btn btn-sm btn-outline-warning mt-1 w-100">✏️ Edit</a>
                <a href="/produk/hapus/${p._id}" class="btn btn-sm btn-outline-danger mt-1 w-100"
                   onclick="return confirm('Yakin hapus produk ini?')">Hapus</a>
                ` : ""}
            </div>
        </div>`;
    });

    html += `</div>`;
    produkKategori.innerHTML = html;
}
