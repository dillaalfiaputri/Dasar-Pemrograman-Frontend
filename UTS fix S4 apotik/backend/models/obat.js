const mongoose = require('mongoose');

const obatSchema = new mongoose.Schema({
    nama: String,
    harga: Number,
    harga_pokok: Number, // ✅ TAMBAHAN
    terjual: Number,
    kategori: String,
    foto: String,
    jumlah: Number,
    kode: String,
    pt: String,
    deskripsi: String
}, {
    collection: 'produks'
});

module.exports = mongoose.model('Obat', obatSchema);