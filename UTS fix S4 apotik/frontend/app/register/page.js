"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Register berhasil, silakan login");
      router.push("/login");
    } else {
      setErrorMessage(data.message || "Register gagal");
    }
  };

  return (
    <div className="container auth-page">
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={() => router.push("/")}>
          Home
        </span>{" "}
        / Register
      </div>
      <div className="login-container">
        <form className="login-box" onSubmit={handleSubmit}>
        <h2>Register Akun</h2>
        <p className="subtitle">Buat akun baru untuk mulai login.</p>

        <input
          className="auth-input"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />

        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {errorMessage && <p className="error">{errorMessage}</p>}

        <button className="auth-btn auth-btn-primary" type="submit">
          Register
        </button>

        <p className="auth-switch-text">
          Sudah punya akun?{" "}
          <span
            className="auth-switch-link"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>
        </form>
      </div>
    </div>
  );
}