"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import {
  createImageFallbackProps,
  handleImageError
} from "../utils/imageUrl";

export default function CartPage() {

  const router = useRouter();

  const {
    cart,
    removeFromCart,
    clearCart
  } = useCart();

  const [namaPembeli, setNamaPembeli] = useState("");
  const [telepon, setTelepon] = useState("");
  const [metodeBayar, setMetodeBayar] = useState("Transfer");

  const total = cart.reduce(
    (sum, item) => sum + item.harga * item.qty,
    0
  );

  const handleCheckout = async () => {

    if (cart.length === 0) {
      alert("Cart kosong");
      return;
    }

    if (!namaPembeli || !telepon) {
      alert("Lengkapi data pembeli");
      return;
    }

    try {

      const user = JSON.parse(localStorage.getItem("user"));

      const items = cart.map((item) => ({
        product_id: item._id,
        qty: item.qty
      }));

      const res = await fetch("http://localhost:5000/checkout", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          nama_pembeli: namaPembeli,
          telepon,
          metode_bayar: metodeBayar,
          user_email: user.email || user.user?.email,
          items
        })
      });

      const data = await res.json();

      if (res.ok) {

        alert("Checkout berhasil");

        clearCart();

        router.push("/");

      } else {

        alert(data.message);

      }

    } catch (err) {

      console.log(err);

      alert("Terjadi error checkout");

    }

  };

  return (
    <div className="container">

      <div className="breadcrumb">
        <span
          className="breadcrumb-link"
          onClick={() => router.push("/")}
        >
          Home
        </span> / Keranjang
      </div>

      <h1>🛒 Keranjang</h1>

      {cart.length === 0 ? (

        <p>Cart kosong</p>

      ) : (

        <>

          {cart.map((item) => {

            const imageProps =
              createImageFallbackProps(item.foto);

            return (

              <div
                key={item._id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  borderRadius: "10px",
                  marginBottom: "15px"
                }}
              >

                <img
                  src={imageProps.src}
                  data-fallback-candidates={
                    imageProps["data-fallback-candidates"]
                  }
                  data-fallback-index={
                    imageProps["data-fallback-index"]
                  }
                  onError={handleImageError}
                  width="80"
                  alt={item.nama}
                />

                <h3>{item.nama}</h3>

                <p>Qty: {item.qty}</p>

                <p>Harga: Rp {item.harga}</p>

                <p>
                  Subtotal:
                  Rp {item.harga * item.qty}
                </p>

                <button
                  onClick={() => removeFromCart(item._id)}
                >
                  Hapus
                </button>

              </div>

            );

          })}

          <div
            style={{
              marginTop: "30px",
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "10px"
            }}
          >

            <h2>Checkout</h2>

            <input
              type="text"
              placeholder="Nama Pembeli"
              value={namaPembeli}
              onChange={(e) =>
                setNamaPembeli(e.target.value)
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px"
              }}
            />

            <input
              type="text"
              placeholder="Nomor Telepon"
              value={telepon}
              onChange={(e) =>
                setTelepon(e.target.value)
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px"
              }}
            />

            <select
              value={metodeBayar}
              onChange={(e) =>
                setMetodeBayar(e.target.value)
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "15px"
              }}
            >

              <option value="Transfer">
                Transfer
              </option>

              <option value="COD">
                COD
              </option>

              <option value="E-Wallet">
                E-Wallet
              </option>

            </select>

            <h2>
              Total: Rp {total}
            </h2>

            <button
              onClick={handleCheckout}
              style={{
                padding: "12px 20px",
                background: "green",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Checkout Sekarang
            </button>

          </div>

        </>

      )}

    </div>
  );
}
