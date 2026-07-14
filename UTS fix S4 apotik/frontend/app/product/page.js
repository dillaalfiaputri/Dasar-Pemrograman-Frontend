"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "../components/ProductCard";

const PRODUCTS_CACHE_KEY = "products-cache-v1";

export default function ProductPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        const safeData = Array.isArray(data) ? data : [];
        setProducts(safeData);
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(safeData));
        setIsFromCache(false);
      })
      .catch(() => {
        const cached = localStorage.getItem(PRODUCTS_CACHE_KEY);
        if (!cached) {
          setProducts([]);
          return;
        }
        try {
          const parsed = JSON.parse(cached);
          setProducts(Array.isArray(parsed) ? parsed : []);
          setIsFromCache(true);
        } catch (_) {
          setProducts([]);
        }
      });
  }, []);

  const filteredProducts = products.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={() => router.push("/")}>
          Home
        </span>{" "}
        / Produk
      </div>
      {isFromCache && (
        <p style={{ color: "#f59e0b", marginBottom: "12px" }}>
          Menampilkan data cache terakhir karena server data tidak bisa diakses.
        </p>
      )}

      <input
        type="text"
        placeholder="Cari obat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          marginBottom: "20px"
        }}
      />

      <div className="grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

    </div>
  );
}