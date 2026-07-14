import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // WAJIB sama dengan model Product
  },
  qty: Number,
});

export default mongoose.models.Cart ||
  mongoose.model("Cart", cartSchema);
