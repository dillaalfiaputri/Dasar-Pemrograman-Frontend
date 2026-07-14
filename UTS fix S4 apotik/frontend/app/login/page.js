"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showRegisterHint, setShowRegisterHint] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setShowRegisterHint(false);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: login,
          password
        })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        router.push("/");
      } else {
        if (res.status === 404) {
          setShowRegisterHint(true);
        }
        alert(data.message);
      }

    } catch (error) {
      console.log(error);
      alert("Terjadi error server");
    }
  };

  return (
    <div className="container auth-page">
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={() => router.push("/")}>
          Home
        </span>{" "}
        / Login
      </div>
      <div className="login-container">
        <form className="login-box" onSubmit={handleLogin}>
        <h2>Login Apotek</h2>
        <p className="subtitle">Masuk untuk lanjut belanja obat.</p>

        <input
          className="auth-input"
          placeholder="Username / Email"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="auth-btn auth-btn-primary" type="submit">
          Login
        </button>

        <p className="auth-switch-text">
          Belum punya akun?{" "}
          <span
            className="auth-switch-link"
            onClick={() => router.push("/register")}
          >
            Register
          </span>
        </p>

        {showRegisterHint && (
          <p className="auth-hint">
            User belum terdaftar. Silakan klik teks Register.
          </p>
        )}

        </form>
      </div>
    </div>
  );
}