function openPopup() {
  const kategori = document.getElementById("kategori").value;
  if (kategori === "pc") {
    document.getElementById("popup-pc").style.display = "block";
  } else if (kategori === "aksesori") {
    document.getElementById("popup-aksesori").style.display = "block";
  } else {
    alert("Pilih kategori terlebih dahulu!");
  }
}

function tutupPopup(kat) {
  document.getElementById("popup-" + kat).style.display = "none";
}

function simpanBarang(kat) {
  const radios = document.querySelectorAll(`#popup-${kat} input[name="barang-${kat}"]`);
  let selected = null;
  radios.forEach(r => { if (r.checked) selected = r.value; });
  if (!selected) return alert("Pilih salah satu barang!");

  const [nama, harga] = selected.split("|");
  document.getElementById("nama").value = nama;
  document.getElementById("harga").value = harga;
  tutupPopup(kat);
}

// === Popup Jenis Penjualan ===
function openPopupJenis() {
  document.getElementById("popup-jenis").style.display = "block";
}

function tutupPopupJenis() {
  document.getElementById("popup-jenis").style.display = "none";
}

function simpanJenis() {
  const radios = document.querySelectorAll(`#popup-jenis input[name="jenis-penjualan"]`);
  let selected = null;
  radios.forEach(r => { if (r.checked) selected = r.value; });
  if (!selected) return alert("Pilih jenis penjualan!");
  document.getElementById("jenis").value = selected;
  tutupPopupJenis();

  // 🔹 Tambahan: langsung hitung otomatis
  hitung();
}

// === Hitung Total ===
function hitung() {
  const harga = parseFloat(document.getElementById("harga").value) || 0;
  const jumlah = parseInt(document.getElementById("jumlah").value) || 0;
  const jenis = document.getElementById("jenis").value;
  const kategori = document.getElementById("kategori").value;

  if (!harga || !jumlah || !jenis || !kategori) {
    return; // tidak tampil alert lagi agar tidak mengganggu popup
  }

  const total = harga * jumlah;
  let diskon = 0;
  let pajak = 0;

  // Diskon 10% untuk penjualan tunai
  if (jenis === "tunai") {
    diskon = 0.1 * total;
  }

  // Pajak 15% untuk PC, 10% untuk Aksesoris
  pajak = (kategori === "pc") ? 0.15 * harga : 0.1 * harga;

  const hargaTotal = total - diskon + pajak;

  document.getElementById("total").value = total.toLocaleString("id-ID");
  document.getElementById("diskon").value = diskon.toLocaleString("id-ID");
  document.getElementById("pajak").value = pajak.toLocaleString("id-ID");
  document.getElementById("hargaTotal").value = hargaTotal.toLocaleString("id-ID");
}
