"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  const product = useMemo(
    () => products.find((item) => item._id === id),
    [products, id]
  );

  if (isLoading) {
    return (
      <div className="container">
        <div className="breadcrumb">
          <span className="breadcrumb-link" onClick={() => router.push("/")}>
            Home
          </span>{" "}
          /{" "}
          <span className="breadcrumb-link" onClick={() => router.push("/product")}>
            Produk
          </span>{" "}
          / Edit
        </div>
        <p>Loading produk...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="breadcrumb">
          <span className="breadcrumb-link" onClick={() => router.push("/")}>
            Home
          </span>{" "}
          /{" "}
          <span className="breadcrumb-link" onClick={() => router.push("/product")}>
            Produk
          </span>{" "}
          / Edit
        </div>
        <p>Produk tidak ditemukan.</p>
        <button onClick={() => router.push("/")}>Kembali</button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={() => router.push("/")}>
          Home
        </span>{" "}
        /{" "}
        <span className="breadcrumb-link" onClick={() => router.push("/product")}>
          Produk
        </span>{" "}
        / Edit
      </div>
      <h2>Edit Produk</h2>
      <p>Nama: {product.nama}</p>
      <p>Harga: Rp {product.harga}</p>
      <p>Fitur edit lengkap bisa dilanjutkan dari halaman ini.</p>
    </div>
  );
}