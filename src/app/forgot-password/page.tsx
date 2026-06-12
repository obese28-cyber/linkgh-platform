"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email."); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
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

      {/* Logo */}
      <a href="/" style={{ fontWeight: 900, fontSize: 26, color: "white", textDecoration: "none", marginBottom: 40 }}>
        Link<span style={{ color: "#0A79A4" }}>GH</span>
      </a>

      <div style={{ width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "40px 36px" }}>

        {sent ? (
          /* Success state */
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(10,121,164,0.15)", border: "1px solid rgba(10,121,164,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A79A4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 10px", color: "white" }}>Check your email</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6, margin: "0 0 28px" }}>
              We sent a password reset link to <strong style={{ color: "white" }}>{email}</strong>. Click the link in that email to set a new password.
            </p>
            <a href="/login" style={{ display: "block", background: "#0A79A4", color: "white", padding: "13px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 15, textAlign: "center" }}>
              Back to login
            </a>
          </div>
        ) : (
          /* Form state */
          <>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px", color: "white" }}>Forgot password?</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 32px", lineHeight: 1.5 }}>
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  autoFocus
                />
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
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 28, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              Remember it?{" "}
              <a href="/login" style={{ color: "#0A79A4", textDecoration: "none", fontWeight: 600 }}>Back to login</a>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
