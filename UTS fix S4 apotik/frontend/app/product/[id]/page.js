"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createImageFallbackProps, handleImageError } from "../../utils/imageUrl";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data?._id ? data : null))
      .catch(() => setProduct(null));
  }, [id]);

  if (!product) return <p>Loading...</p>;
  const imageProps = createImageFallbackProps(product.foto);

  return (
    <div className="container detail">
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={() => router.push("/")}>
          Home
        </span>{" "}
        /{" "}
        <span className="breadcrumb-link" onClick={() => router.push("/product")}>
          Produk
        </span>{" "}
        / Detail
      </div>

    <img
      src={imageProps.src}
      data-fallback-candidates={imageProps["data-fallback-candidates"]}
      data-fallback-index={imageProps["data-fallback-index"]}
      alt={product.nama}
      onError={handleImageError}
      style={{
        width: "100%",
        maxWidth: "360px",
        maxHeight: "360px",
        objectFit: "contain",
        borderRadius: "10px",
      }}
    />

      <h1>{product.nama}</h1>
      <h3>Rp {product.harga}</h3>

      <p>{product.deskripsi}</p>

      <button className="btn">
        🛒 Tambah ke Cart
      </button>

    </div>
  );
}