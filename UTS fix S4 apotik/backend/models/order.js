const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  no_order: String,

  tanggal: String,

  nama_pembeli: String,

  telepon: String,

  user_email: String,

  metode_bayar: String,

  status: String,

  total: Number,

  items: [
    {
      nama_barang: String,
      qty: Number,
      harga: Number,
      harga_pokok: Number,
      profit: Number,
      subtotal: Number
    }
  ]

});

module.exports =
  mongoose.model("Order", orderSchema);
