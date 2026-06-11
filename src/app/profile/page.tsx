"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
export default function ProfilePage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  async function uploadResume() {
    if (!file) {
      setMessage("Please choose a CV first.");
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      window.location.href = "/login";
      return;
    }
    const safeFileName = file.name.replaceAll(" ", "_");
    const filePath = `${userData.user.id}/${safeFileName}`;
    const { error } = await supabase.storage
      .from("Resumes")
      .upload(filePath, file, {
        upsert: true,
      });
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("CV uploaded successfully.");
  }
  return (
    <main style={{ minHeight: "100vh", background: "#04070D", color: "white", padding: 40 }}>
      <a href="/dashboard" style={{ color: "white" }}>← Back to Dashboard</a>
      <h1 style={{ marginTop: 40 }}>Profile & CV</h1>
      <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 30 }}>
        Upload your CV so you can use it later for job applications.
      </p>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ marginBottom: 20 }}
      />
      <br />
      <button
        onClick={uploadResume}
        style={{
          background: "#0A79A4",
          color: "white",
          border: 0,
          padding: "12px 20px",
          borderRadius: 12,
          cursor: "pointer",
        }}
      >
        Upload CV
      </button>
      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </main>
  );
}
