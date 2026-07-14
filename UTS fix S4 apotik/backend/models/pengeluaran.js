const mongoose = require("mongoose");

const PengeluaranSchema = new mongoose.Schema({
    tanggal: {
        type: Date,
        required: true
    },
    kategori: {
        type: String,
        required: true
    },
    keterangan: {
        type: String
    },
    nominal: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Pengeluaran", PengeluaranSchema);