"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      alert(error.message);
      return;
    }
    alert("Account created. Check your email to confirm.");
  }
  return (
    <main style={{ minHeight: "100vh", background: "#04070D", color: "white", padding: 40 }}>
      <form onSubmit={handleRegister} style={{ maxWidth: 420, margin: "80px auto" }}>
        <h1>Create Account</h1>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 14, marginBottom: 12 }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 14, marginBottom: 12 }} />
        <button style={{ width: "100%", padding: 14, background: "#0A79A4", color: "white", border: 0 }}>
          Create Account
        </button>
      </form>
    </main>
  );
}
