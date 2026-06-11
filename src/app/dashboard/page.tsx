"use client";
import { useEffect, useState } from "react";
import jobsData from "@/data/jobs.json";
import { supabase } from "@/lib/supabase";
const jobs: any[] = Array.isArray(jobsData)
  ? jobsData
  : Array.isArray((jobsData as any).default)
  ? (jobsData as any).default
  : Object.values(jobsData || {});
export default function DashboardPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  useEffect(() => {
    const savedIds = JSON.parse(localStorage.getItem("linkgh_saved_jobs") || "[]");
    const matchedJobs = jobs.filter((job: any) => savedIds.includes(job.id));
    setSavedJobs(matchedJobs);
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserEmail(data.user.email || "");
        setUserName(data.user.user_metadata?.full_name || data.user.email || "LinkGH User");
      }
    }
    loadUser();
  }, []);
  return (
    <main style={{ minHeight: "100vh", background: "#04070D", color: "white", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <a href="/" style={{ fontWeight: 900, fontSize: 20, color: "white", textDecoration: "none" }}>
          Link<span style={{ color: "#0A79A4" }}>GH</span>
        </a>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <a href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>Home</a>
          <a href="/dashboard" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>Dashboard</a>
          <a href="/profile" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "8px 16px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Profile / CV</a>
          <button
            onClick={async () => { localStorage.removeItem("linkgh_saved_jobs"); window.location.href = "/login"; }}
            style={{ background: "#8B0000", color: "white", border: "none", padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(10,121,164,0.25), rgba(255,255,255,0.03))", border: "1px solid rgba(10,121,164,0.3)", borderRadius: 20, padding: "28px 32px", marginBottom: 36, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Welcome back</p>
            <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>{userName}</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 4, fontSize: 14 }}>{userEmail}</p>
          </div>
          <a href="/profile" style={{ background: "#0A79A4", color: "white", padding: "10px 20px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>Upload CV</a>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Saved Jobs</h1>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: 20 }}>{savedJobs.length} saved</span>
        </div>

        {savedJobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20 }}>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>No saved jobs yet</p>
            <a href="/" style={{ background: "#0A79A4", color: "white", padding: "10px 24px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>Browse Jobs</a>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {savedJobs.map((job: any) => (
              <div key={job.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <a href={"/jobs/" + job.id} style={{ textDecoration: "none", color: "white", flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#0A79A4", textTransform: "uppercase", letterSpacing: "0.06em" }}>{job.category}</span>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: "6px 0 4px" }}>{job.title}</h2>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: 0 }}>{job.company} · {job.location}</p>
                </a>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    defaultValue="Saved"
                    style={{ background: "#111827", color: "white", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 12px", borderRadius: 10, fontSize: 13 }}
                  >
                    <option>Saved</option>
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                  </select>
                  <button
                    onClick={() => {
                      const updatedJobs = savedJobs.filter((j: any) => j.id !== job.id);
                      setSavedJobs(updatedJobs);
                      localStorage.setItem("linkgh_saved_jobs", JSON.stringify(updatedJobs.map((j: any) => j.id)));
                    }}
                    style={{ background: "rgba(139,0,0,0.3)", color: "#FF6B6B", border: "1px solid rgba(139,0,0,0.4)", padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
