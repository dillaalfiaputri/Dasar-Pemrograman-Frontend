const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");

require("./db");

const Obat = require("./models/obat");
const User = require("./models/user");
const Order = require("./models/order");
const Pengeluaran = require("./models/pengeluaran");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../frontend/public/images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const search = req.query.search || "";

    let query = {};

    if (search) {
      query = {
        $or: [
          { nama: { $regex: search, $options: "i" } },
          { kategori: { $regex: search, $options: "i" } },
          { kode: { $regex: search, $options: "i" } },
          { deskripsi: { $regex: search, $options: "i" } }
        ]
      };
    }

    const total = await Obat.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const obat = await Obat.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.render("index", {
      obat,
      search,
      currentPage: page,
      totalPages
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error server");
  }
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", upload.single("file"), async (req, res) => {

  const {
    kode,
    nama,
    kategori,
    harga,
    harga_pokok,
    jumlah,
    pt,
    deskripsi,
    image_data
  } = req.body;

  let foto = null;

  // JIKA UPLOAD FILE BIASA
  if (req.file) {

    foto = `http://localhost:5000/images/${req.file.filename}`;

  }

  // JIKA FOTO DARI WEBCAM
  if (image_data) {

    const base64Data =
      image_data.replace(/^data:image\/png;base64,/, "");

    const fileName = Date.now() + ".png";

    const filePath = path.join(
      __dirname,
      "../frontend/public/images",
      fileName
    );

    fs.writeFileSync(filePath, base64Data, "base64");

    foto = `http://localhost:5000/images/${fileName}`;
  }

  await Obat.create({
    kode,
    nama,
    kategori,
    harga,
    harga_pokok,
    jumlah,
    pt,
    deskripsi,
    foto
  });

  res.redirect("/");
});

app.get("/edit/:id", async (req, res) => {
  const obat = await Obat.findById(req.params.id);

  if (!obat) return res.send("Data tidak ditemukan");

  res.render("edit", { obat });
});

app.post("/edit/:id", upload.single("file"), async (req, res) => {
  const data = {
    ...req.body
  };

  if (req.file) {
    data.foto = `http://localhost:5000/images/${req.file.filename}`;
  }

  await Obat.findByIdAndUpdate(req.params.id, data);

  res.redirect("/");
});

app.get("/delete/:id", async (req, res) => {
  await Obat.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  try {
    let { login, password } = req.body;

    const user = await User.findOne({
      $or: [
        { username: login },
        { email: login }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Password salah" });
    }

    res.json({
      token: "login-success",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

console.log("PATH IMAGE:", path.join(__dirname, "../frontend/public/images"));
app.use("/images", express.static(
  path.join(__dirname, "../frontend/public/images")
));
app.get("/products", async (req, res) => {
  const data = await Obat.find();
  res.json(data);
});

app.post("/checkout", async (req, res) => {
  try {

    const {
      nama_pembeli,
      telepon,
      metode_bayar,
      user_email,
      items
    } = req.body;

    let total = 0;

    const detailItems = [];

    for (const item of items) {

      const obat = await Obat.findById(item.product_id);

      if (!obat) continue;

      const qty = item.qty;

      const subtotal = obat.harga * qty;

      const profit =
        (obat.harga - obat.harga_pokok) * qty;

      detailItems.push({
        nama_barang: obat.nama,
        qty,
        harga: obat.harga,
        harga_pokok: obat.harga_pokok,
        profit,
        subtotal
      });

      total += subtotal;

      obat.jumlah -= qty;
      await obat.save();
    }

    const order = await Order.create({
      no_order: "ORD" + Date.now(),
      tanggal: new Date(),

      nama_pembeli,

      telepon,

      user_email,

      metode_bayar,

      status: "Menunggu Konfirmasi",

      items: detailItems,

      total
    });

    res.json({
      message: "Checkout berhasil",
      order
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error"
    });
  }
});

app.get("/laporan-penjualan", async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    const tanggal_awal =
      req.query.tanggal_awal || "";

    const tanggal_akhir =
      req.query.tanggal_akhir || "";

    const orders = await Order.find();

    let totalProfit = 0;
    let totalOmzet = 0;

    let laporan = [];

    orders.forEach((order) => {

      const orderDate = new Date(order.tanggal);

      if (isNaN(orderDate)) {
        return;
      }

      const tanggalFormat =
        orderDate.toISOString().split("T")[0];

      // FILTER RENTANG TANGGAL
      if (tanggal_awal && tanggal_akhir) {

        if (
          tanggalFormat < tanggal_awal ||
          tanggalFormat > tanggal_akhir
        ) {
          return;
        }

      }

      order.items.forEach((item) => {

        totalProfit += item.profit;
        totalOmzet += item.subtotal;

        laporan.push({
          _id: order._id,
          no_order: order.no_order,
          tanggal: tanggalFormat,
          nama_pembeli: order.nama_pembeli,
          telepon: order.telepon,
          jumlah_item: order.items.length,
          nama_barang: item.nama_barang,
          total: item.subtotal,
          metode_bayar: order.metode_bayar,
          status: order.status,
          profit: item.profit
        });

      });

    });

    const totalData = laporan.length;
    const totalPages =
      Math.ceil(totalData / limit);

    const startIndex =
      (page - 1) * limit;

    const endIndex =
      startIndex + limit;

    const paginatedData =
      laporan.slice(startIndex, endIndex);

    res.render("laporan-penjualan", {
      laporan: paginatedData,
      totalProfit,
      totalOmzet,
      currentPage: page,
      totalPages,
      tanggal_awal,
      tanggal_akhir
    });

  } catch (err) {

    console.log(err);

    res.status(500).send("Server Error");

  }
});

app.get("/my-orders/:email", async (req, res) => {

  try {

    const email = req.params.email;

    const orders = await Order.find({
      user_email: email
    });

    res.json(orders);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }

});

app.get("/detail-order/:id", async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);

    if(!order){
      return res.send("Order tidak ditemukan");
    }

    res.render("detail-order", {
      order
    });

  } catch(err){

    console.log(err);

    res.status(500).send("Server Error");

  }

});

app.get("/delete-order/:id", async (req, res) => {

  try {

    await Order.findByIdAndDelete(req.params.id);

    res.redirect("/laporan-penjualan");

  } catch(err){

    console.log(err);

    res.status(500).send("Server Error");

  }

});

app.put("/update-order-status/:id", async (req, res) => {

  try {

    const { status } = req.body;

    await Order.findByIdAndUpdate(
      req.params.id,
      { status }
    );

    res.json({
      message: "Status berhasil diupdate"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }

});

app.get("/laporan-keuangan", async (req, res) => {

try {

const tanggal_awal =
  req.query.tanggal_awal || "";

const tanggal_akhir =
  req.query.tanggal_akhir || "";

const orders = await Order.find();

let harian = 0;
let mingguan = 0;
let bulanan = 0;

let totalOmzet = 0;
let totalProfit = 0;
let totalModal = 0;

let labaKotor = 0;

// sementara manual
const filter = {};

if (tanggal_awal && tanggal_akhir) {

    filter.tanggal = {
        $gte: new Date(tanggal_awal),
        $lte: new Date(tanggal_akhir + "T23:59:59")
    };

}

const pengeluaranData = await Pengeluaran.find(filter);

let pengeluaran = 0;

pengeluaranData.forEach((item) => {
    pengeluaran += item.nominal;
});

let labaBersih = 0;

let jumlahTransaksi = 0;
let totalProdukTerjual = 0;

let detailLaporan = [];

let statistikProduk = {};

const now = new Date();

orders.forEach((o) => {

  const orderDate = new Date(o.tanggal);

  if (isNaN(orderDate)) return;

  const tanggalFormat =
    orderDate.toISOString().split("T")[0];

  // FILTER TANGGAL
  if (tanggal_awal && tanggal_akhir) {

    if (
      tanggalFormat < tanggal_awal ||
      tanggalFormat > tanggal_akhir
    ) {
      return;
    }

  }

  jumlahTransaksi++;

  const total = o.total || 0;

  totalOmzet += total;

  // HARIAN
  if (
    orderDate.toDateString() ===
    now.toDateString()
  ) {
    harian += total;
  }

  // MINGGUAN
  const diffDays =
    (now - orderDate) /
    (1000 * 60 * 60 * 24);

  if (diffDays <= 7) {
    mingguan += total;
  }

  // BULANAN
  if (
    orderDate.getMonth() === now.getMonth() &&
    orderDate.getFullYear() === now.getFullYear()
  ) {
    bulanan += total;
  }

  // DETAIL ITEM
  o.items.forEach((item) => {

    const qty = item.qty || 0;

    const subtotal =
      item.subtotal || 0;

    const modal =
      (item.harga_pokok || 0) * qty;

    const profit =
      item.profit || 0;

    totalProdukTerjual += qty;

    totalProfit += profit;

    totalModal += modal;

    // DETAIL TABEL
    detailLaporan.push({

      no_order: o.no_order,

      tanggal: tanggalFormat,

      nama_pembeli:
        o.nama_pembeli,

      nama_barang:
        item.nama_barang,

      qty,

      harga:
        item.harga,

      harga_pokok:
        item.harga_pokok,

      subtotal,

      profit,

      metode_bayar:
        o.metode_bayar,

      status:
        o.status

    });

    // STATISTIK PRODUK
    if (!statistikProduk[item.nama_barang]) {

      statistikProduk[item.nama_barang] = {

        qty: 0,
        profit: 0

      };

    }

    statistikProduk[item.nama_barang].qty += qty;

    statistikProduk[item.nama_barang].profit += profit;

  });

});

labaKotor =
  totalOmzet - totalModal;

labaBersih =
  labaKotor - pengeluaran;

res.render("laporan-keuangan", {

    harian,
    mingguan,
    bulanan,

    totalOmzet,
    totalProfit,

    totalModal,

    labaKotor,

    pengeluaran,

    pengeluaranData,

    labaBersih,

    jumlahTransaksi,

    totalProdukTerjual,

    detailLaporan,

    statistikProduk,

    tanggal_awal,
    tanggal_akhir

});

} catch (err) {

console.log(err);

res.status(500).send("Server Error");

}

});

app.post("/pengeluaran", async (req, res) => {

    await Pengeluaran.create({
        tanggal: req.body.tanggal,
        kategori: req.body.kategori,
        keterangan: req.body.keterangan,
        nominal: req.body.nominal
    });

    res.redirect("/laporan-keuangan");

});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend jalan di http://localhost:${PORT}`);
});