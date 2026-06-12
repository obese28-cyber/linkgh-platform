"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the token in the URL hash; the JS SDK picks it up automatically
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    color: "white",
    fontSize: 15,
    padding: "13px 16px",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#04070D", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: "24px" }}>

      <a href="/" style={{ fontWeight: 900, fontSize: 26, color: "white", textDecoration: "none", marginBottom: 40 }}>
        Link<span style={{ color: "#0A79A4" }}>GH</span>
      </a>

      <div style={{ width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "40px 36px" }}>

        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 10px", color: "white" }}>Password updated!</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: "0 0 28px" }}>Your password has been changed. You can now log in with your new password.</p>
            <a href="/login" style={{ display: "block", background: "#0A79A4", color: "white", padding: "13px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 15, textAlign: "center" }}>
              Go to login
            </a>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
            <p>Verifying reset link...</p>
            <p style={{ marginTop: 16, fontSize: 13 }}>If this takes too long, <a href="/forgot-password" style={{ color: "#0A79A4" }}>request a new link</a>.</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px", color: "white" }}>Set new password</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 32px" }}>Choose a strong password for your account.</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  New password
                </label>
                <input type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} autoFocus />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Confirm password
                </label>
                <input type="password" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} />
              </div>

              {error && (
                <div style={{ background: "rgba(139,0,0,0.15)", border: "1px solid rgba(139,0,0,0.3)", borderRadius: 10, padding: "10px 14px", color: "#FF6B6B", fontSize: 13 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ background: "#0A79A4", color: "white", border: "none", padding: "13px", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 15, opacity: loading ? 0.7 : 1, marginTop: 4 }}
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
