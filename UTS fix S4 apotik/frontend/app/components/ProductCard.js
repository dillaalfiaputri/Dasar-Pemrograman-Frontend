"use client";

import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { createImageFallbackProps, handleImageError } from "../utils/imageUrl";

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const imageProps = createImageFallbackProps(product.foto);

  const handleAddToCart = () => {
    const user = localStorage.getItem("user");

    if (!user) {
      alert("Kamu harus login dulu sebelum menambahkan ke keranjang");
      router.push("/login");
      return;
    }

    addToCart(product);
    alert("Ditambahkan ke cart");
  };

  return (
    <div className="card">
      <img
        src={imageProps.src}
        data-fallback-candidates={imageProps["data-fallback-candidates"]}
        data-fallback-index={imageProps["data-fallback-index"]}
        onError={handleImageError}
        alt={product.nama}
      />

      <h3>{product.nama}</h3>
      <p className="price">Rp {product.harga}</p>

      <div className="btn-group">

        <button onClick={() => router.push(`/product/${product._id}`)}>
          Detail
        </button>

        <button onClick={handleAddToCart}>
          + Cart
        </button>

      </div>

    </div>
  );
}