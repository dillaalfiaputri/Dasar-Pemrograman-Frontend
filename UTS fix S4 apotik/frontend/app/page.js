"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "./components/ProductCard";

const PRODUCTS_CACHE_KEY = "products-cache-v1";

export default function Page() {

  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {

    fetch("/api/products")
      .then(res => res.json())
      .then(data => {

        if (Array.isArray(data)) {

          setProducts(data);

          localStorage.setItem(
            PRODUCTS_CACHE_KEY,
            JSON.stringify(data)
          );

          setIsFromCache(false);

        } else {

          console.log("Data bukan array:", data);

          setProducts([]);

        }

      })

      .catch(err => {

        console.log("Fetch error:", err);

        const cached =
          localStorage.getItem(PRODUCTS_CACHE_KEY);

        if (cached) {

          try {

            const parsed = JSON.parse(cached);

            setProducts(
              Array.isArray(parsed) ? parsed : []
            );

            setIsFromCache(true);

            return;

          } catch (_) {}

        }

        setProducts([]);

      });

  }, []);

  const filtered = Array.isArray(products)

    ? products.filter((p) =>
        p.nama
          ?.toLowerCase()
          .includes(search.toLowerCase())
      )

    : [];

  return (

    <div className="container">

      <div className="breadcrumb">
        Home
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}
      >

        <h1>💊 APOTEK VIA</h1>

        <button
          onClick={() => router.push("/my-orders")}
        >
          📦 Pesanan Saya
        </button>

      </div>

      {isFromCache && (

        <p
          style={{
            color: "#f59e0b",
            marginBottom: "12px"
          }}
        >
          Menampilkan data cache terakhir
          karena server data tidak bisa diakses.
        </p>

      )}

      <input
        placeholder="Cari obat..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          marginBottom: "20px",
          padding: "10px"
        }}
      />

      <div className="grid">

        {filtered.map((p) => (

          <ProductCard
            key={p._id}
            product={p}
          />

        ))}

      </div>

    </div>

  );

}