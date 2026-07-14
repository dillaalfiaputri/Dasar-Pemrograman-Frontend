import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  nama: String,
  harga: Number,
  foto: String, // ✅ SAMAKAN DENGAN DATABASE
});

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema, "produks");