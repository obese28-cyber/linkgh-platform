"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import jobsData from "@/data/jobs.json";

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
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      setUserEmail(data.user.email || "");
      setUserName(data.user.user_metadata?.full_name || data.user.email || "LinkGH User");
    }

    const savedIds = JSON.parse(localStorage.getItem("linkgh_saved_jobs") || "[]");
    setSavedJobs(jobs.filter((job: any) => savedIds.includes(job.id)));

    loadUser();
  }, []);

  function removeSavedJob(jobId: number) {
    const updatedJobs = savedJobs.filter((job: any) => job.id !== jobId);
    setSavedJobs(updatedJobs);
    localStorage.setItem("linkgh_saved_jobs", JSON.stringify(updatedJobs.map((job: any) => job.id)));
  }

  return (
    <main style={{ minHeight: "100vh", background: "#04070D", color: "white", padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15 }}>{userName || userEmail}</p>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{userEmail}</p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "10px 18px", borderRadius: 12, textDecoration: "none", fontWeight: 600 }}>Home</a>
          <a href="/dashboard" style={{ background: "#0A79A4", color: "white", padding: "10px 18px", borderRadius: 12, textDecoration: "none", fontWeight: 700 }}>Saved Jobs</a>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }} style={{ background: "#8B0000", border: "none", color: "white", padding: "10px 18px", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, rgba(10,121,164,0.18), rgba(255,255,255,0.03))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 28, marginBottom: 40 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>Saved Jobs</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: 700 }}>
          Track opportunities you are interested in and access them quickly from your professional dashboard.
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 20, padding: 40, textAlign: "center" }}>
          <h3 style={{ marginBottom: 12, fontSize: 24 }}>No saved jobs yet</h3>
          <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: 20 }}>
            Start exploring verified Ghanaian opportunities and save jobs you want to revisit.
          </p>
          <a href="/" style={{ background: "#0A79A4", color: "white", padding: "12px 20px", borderRadius: 12, textDecoration: "none", fontWeight: 700 }}>
            Explore Jobs
          </a>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 24 }}>
          {savedJobs.map((job: any) => (
            <div key={job.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 24 }}>
              <a href={"/jobs/" + job.id} style={{ textDecoration: "none", color: "white", display: "block" }}>
                <p style={{ color: "#0A79A4", marginBottom: 8, fontWeight: 700 }}>{job.category}</p>
                <h2 style={{ fontSize: 24, marginBottom: 8 }}>{job.title}</h2>
                <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>{job.company} · {job.location}</p>
              </a>

              <button onClick={() => removeSavedJob(job.id)} style={{ background: "#8B0000", color: "white", border: 0, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>
                Remove Saved Job
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}