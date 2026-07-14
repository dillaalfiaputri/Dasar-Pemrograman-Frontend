"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      setUser(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
  const data = localStorage.getItem("user");
  if (data) {
    setUser(JSON.parse(data));
  }
}, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <div style={styles.navbar}>
      <h2 style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
        💊 APOTEK VIA
      </h2>

      <div style={styles.right}>
        <button onClick={() => router.push("/product")} style={styles.productBtn}>
          📦 Produk
        </button>
        <button onClick={() => router.push("/cart")} style={styles.cartBtn}>
          🛒 Cart
        </button>

        {user ? (
          <>
            <span style={styles.userText}>
              Halo, {user.email}
            </span>

            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/register")}
              style={styles.registerBtn}
            >
              Register
            </button>
            <button
              onClick={() => router.push("/login")}
              style={styles.loginBtn}
            >
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "#0f172a",
    color: "#fff",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  cartBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  productBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    background: "#334155",
    color: "#fff",
  },
  loginBtn: {
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  registerBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  logoutBtn: {
    background: "red",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  userText: {
    fontSize: "14px",
  },
};

