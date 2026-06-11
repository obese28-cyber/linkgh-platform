"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Signing in...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!data.session) {
      setMessage("No session created. Please check Supabase email confirmation settings.");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main style={{ minHeight: "100vh", background: "#04070D", color: "white", padding: 40 }}>
      <form onSubmit={handleLogin} style={{ maxWidth: 420, margin: "80px auto" }}>
        <h1>Sign In</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 14, marginBottom: 12 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 14, marginBottom: 12 }}
        />

        <button style={{ width: "100%", padding: 14, background: "#0A79A4", color: "white", border: 0 }}>
          Sign In
        </button>

        {message && <p style={{ marginTop: 20 }}>{message}</p>}
      </form>
    </main>
  );
}