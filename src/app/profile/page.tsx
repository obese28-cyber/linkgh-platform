"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Profile {
  full_name: string;
  phone: string;
  linkedin: string;
  location: string;
  bio: string;
  cv_filename: string;
  cv_uploaded_at: string;
}

const empty: Profile = {
  full_name: "",
  phone: "",
  linkedin: "",
  location: "",
  bio: "",
  cv_filename: "",
  cv_uploaded_at: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(empty);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { window.location.href = "/login"; return; }
      setUserId(data.user.id);
      setUserEmail(data.user.email || "");

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (prof) {
        setProfile({
          full_name:      prof.full_name      ?? "",
          phone:          prof.phone          ?? "",
          linkedin:       prof.linkedin       ?? "",
          location:       prof.location       ?? "",
          bio:            prof.bio            ?? "",
          cv_filename:    prof.cv_filename    ?? "",
          cv_uploaded_at: prof.cv_uploaded_at ?? "",
        });
      }
    }
    load();
  }, []);

  function handleChange(field: keyof Profile, value: string) {
    setProfile((p) => ({ ...p, [field]: value }));
  }

  async function saveProfile() {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id:         userId,
      full_name:  profile.full_name,
      phone:      profile.phone,
      linkedin:   profile.linkedin,
      location:   profile.location,
      bio:        profile.bio,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) showToast(error.message, false);
    else showToast("Profile saved!");
  }

  async function uploadCV(file: File) {
    if (!userId) return;
    setUploading(true);
    const safeFileName = file.name.replaceAll(" ", "_");
    const filePath = `${userId}/${safeFileName}`;
    const { error } = await supabase.storage
      .from("Resumes")
      .upload(filePath, file, { upsert: true });

    if (error) { setUploading(false); showToast(error.message, false); return; }

    const uploadedAt = new Date().toISOString();
    await supabase.from("profiles").upsert({
      id:             userId,
      cv_filename:    file.name,
      cv_uploaded_at: uploadedAt,
      updated_at:     uploadedAt,
    });

    setProfile((p) => ({ ...p, cv_filename: file.name, cv_uploaded_at: uploadedAt }));
    setUploading(false);
    showToast("CV uploaded!");
  }

  const cvDate = profile.cv_uploaded_at
    ? new Date(profile.cv_uploaded_at).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "white",
    fontSize: 14,
    padding: "11px 14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 6,
  };

  const fieldWrap: React.CSSProperties = { display: "flex", flexDirection: "column" };

  return (
    <main style={{ minHeight: "100vh", background: "#04070D", color: "white", fontFamily: "system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <a href="/" style={{ fontWeight: 900, fontSize: 20, color: "white", textDecoration: "none" }}>
          Link<span style={{ color: "#0A79A4" }}>GH</span>
        </a>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>Home</a>
          <a href="/dashboard" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>Dashboard</a>
          <a href="/profile" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "8px 16px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Profile / CV</a>
          <button
            onClick={async () => { await supabase.auth.signOut(); localStorage.removeItem("linkgh_saved_jobs"); window.location.href = "/login"; }}
            style={{ background: "#8B0000", color: "white", border: "none", padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 6px" }}>Profile &amp; CV</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: 14 }}>{userEmail}</p>
        </div>

        {/* Profile card */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "32px", marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 24px", color: "rgba(255,255,255,0.9)" }}>Personal Details</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} placeholder="Ada Lovelace" value={profile.full_name} onChange={(e) => handleChange("full_name", e.target.value)} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} placeholder="+233 20 000 0000" value={profile.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Location</label>
              <input style={inputStyle} placeholder="Accra, Ghana" value={profile.location} onChange={(e) => handleChange("location", e.target.value)} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>LinkedIn</label>
              <input style={inputStyle} placeholder="https://linkedin.com/in/yourname" value={profile.linkedin} onChange={(e) => handleChange("linkedin", e.target.value)} />
            </div>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Bio / About</label>
            <textarea
              rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              placeholder="Tell recruiters a bit about yourself..."
              value={profile.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
            />
          </div>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={saveProfile}
              disabled={saving}
              style={{ background: "#0A79A4", color: "white", border: "none", padding: "11px 28px", borderRadius: 12, cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        {/* CV card */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "32px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px", color: "rgba(255,255,255,0.9)" }}>CV / Resume</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 24px" }}>Accepted formats: PDF, DOC, DOCX</p>

          {profile.cv_filename ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(10,121,164,0.1)", border: "1px solid rgba(10,121,164,0.25)", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A79A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{profile.cv_filename}</p>
                {cvDate && <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Uploaded {cvDate}</p>}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0A79A4", background: "rgba(10,121,164,0.15)", padding: "3px 10px", borderRadius: 20 }}>CURRENT</span>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 20px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12, marginBottom: 20 }}>
              <p style={{ color: "rgba(255,255,255,0.3)", margin: 0, fontSize: 14 }}>No CV uploaded yet</p>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCV(f); }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ width: "100%", background: uploading ? "rgba(10,121,164,0.4)" : "rgba(10,121,164,0.15)", border: "1px solid rgba(10,121,164,0.4)", color: uploading ? "rgba(255,255,255,0.5)" : "#0A79A4", padding: "13px", borderRadius: 12, cursor: uploading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14 }}
          >
            {uploading ? "Uploading..." : profile.cv_filename ? "Replace CV" : "Upload CV"}
          </button>
        </div>
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: toast.ok ? "#0A79A4" : "#8B0000",
          color: "white", padding: "12px 24px", borderRadius: 12,
          fontWeight: 700, fontSize: 14, zIndex: 9999,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          {toast.msg}
        </div>
      )}
    </main>
  );
}
