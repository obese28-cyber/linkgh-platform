"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "white",
    fontSize: 15,
    padding: "13px 16px",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#04070D", color: "white", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <nav style={{ padding: "0 32px", height: 64, display: "flex", alignItems: "center" }}>
        <a href="/" style={{ fontWeight: 900, fontSize: 20, color: "white", textDecoration: "none" }}>
          Link<span style={{ color: "#0A79A4" }}>GH</span>
        </a>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "40px 36px" }}>

          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 10px" }}>Check your email</h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: "0 0 24px" }}>
                We sent a confirmation link to <strong style={{ color: "white" }}>{email}</strong>. Click it to activate your account.
              </p>
              <a href="/login" style={{ color: "#0A79A4", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>Back to sign in →</a>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>Create account</h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 28px" }}>Join LinkGH and start tracking your job search</p>

              {/* Google button */}
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "white", color: "#111", border: "none", borderRadius: 12, padding: "13px", fontWeight: 700, fontSize: 15, cursor: googleLoading ? "not-allowed" : "pointer", marginBottom: 20, opacity: googleLoading ? 0.7 : 1 }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                {googleLoading ? "Redirecting..." : "Sign up with Google"}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              </div>

              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Email</label>
                  <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Password</label>
                  <input type="password" required placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                </div>

                {error && (
                  <div style={{ background: "rgba(139,0,0,0.2)", border: "1px solid rgba(139,0,0,0.4)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#FF6B6B" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ background: "#0A79A4", color: "white", border: "none", borderRadius: 12, padding: "13px", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
                Already have an account?{" "}
                <a href="/login" style={{ color: "#0A79A4", textDecoration: "none", fontWeight: 700 }}>Sign in</a>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
