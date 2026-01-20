function renderProdukKategori(data) {
    const container = document.getElementById("produk-kategori");
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = "<p class='text-muted'>Produk tidak ditemukan</p>";
        return;
    }

    let html = '<div class="row g-3">';

    data.forEach(product => {
        html += `
            <div class="col-6">
                <div class="product-card shadow-sm">
                    <img src="/uploads/${product.foto}" class="w-100">
                    <small class="fw-semibold d-block">${product.nama}</small>
                    <small class="text-primary fw-bold fs-6">
                        Rp ${product.harga.toLocaleString()}
                    </small>
                    <small class="text-muted">
                        Terjual: ${product.terjual || 0} pcs
                    </small>
                    <small class="text-muted">
                        Stok: ${
                            product.jumlah > 0
                            ? product.jumlah + " pcs"
                            : "<span class='text-danger fw-bold'>Habis</span>"
                        }
                    </small>

                    <a href="/product/${product._id}"
                       class="btn btn-sm btn-outline-primary mt-1 w-100">
                        Detail
                    </a>
                </div>
            </div>
        `;
    });

    html += "</div>";
    container.innerHTML = html;
}
