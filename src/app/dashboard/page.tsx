"use client";
import { useEffect, useState } from "react";
import jobsData from "@/data/jobs.json";
import { supabase } from "@/lib/supabase";

const STATUS_OPTIONS = ["Saved", "Applied", "Interview", "Offer", "Rejected"] as const;
type Status = typeof STATUS_OPTIONS[number];

const STATUS_COLORS: Record<Status, { bg: string; color: string }> = {
  Saved:     { bg: "rgba(255,255,255,0.06)",  color: "rgba(255,255,255,0.6)" },
  Applied:   { bg: "rgba(10,121,164,0.2)",    color: "#0A79A4" },
  Interview: { bg: "rgba(234,179,8,0.15)",    color: "#EAB308" },
  Offer:     { bg: "rgba(34,197,94,0.15)",    color: "#22C55E" },
  Rejected:  { bg: "rgba(139,0,0,0.2)",       color: "#FF6B6B" },
};

const jobs: any[] = Array.isArray(jobsData)
  ? jobsData
  : Array.isArray((jobsData as any).default)
  ? (jobsData as any).default
  : Object.values(jobsData || {});

export default function DashboardPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [savingStatus, setSavingStatus] = useState<Record<string, boolean>>({});
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // Load user
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        setUserEmail(data.user.email || "");
        setUserName(data.user.user_metadata?.full_name || data.user.email || "LinkGH User");
      }

      // Load saved jobs from Supabase
      if (data.user) {
        const { data: savedRows } = await supabase
          .from("saved_jobs")
          .select("job_id")
          .eq("user_id", data.user.id);

        const savedIds = (savedRows ?? []).map((r: any) => r.job_id);
        const matchedJobs = jobs.filter((job: any) => savedIds.includes(String(job.id)));
        setSavedJobs(matchedJobs);

        // Load persisted statuses
        if (matchedJobs.length > 0) {
          const jobIds = matchedJobs.map((j: any) => String(j.id));
          const { data: statusRows } = await supabase
            .from("application_statuses")
            .select("job_id, status")
            .eq("user_id", data.user.id)
            .in("job_id", jobIds);

          if (statusRows) {
            const map: Record<string, Status> = {};
            statusRows.forEach((r: any) => { map[r.job_id] = r.status as Status; });
            setStatuses(map);
          }
        }
      }
    }
    load();
  }, []);

  async function updateStatus(jobId: string, newStatus: Status) {
    // Optimistic update
    setStatuses((prev) => ({ ...prev, [jobId]: newStatus }));

    if (!userId) return;
    setSavingStatus((prev) => ({ ...prev, [jobId]: true }));

    await supabase.from("application_statuses").upsert(
      { user_id: userId, job_id: jobId, status: newStatus, updated_at: new Date().toISOString() },
      { onConflict: "user_id,job_id" }
    );

    setSavingStatus((prev) => ({ ...prev, [jobId]: false }));
  }

  async function removeJob(jobId: string) {
    setSavedJobs((prev) => prev.filter((j: any) => String(j.id) !== String(jobId)));
    if (userId) {
      await supabase.from("saved_jobs").delete().eq("user_id", userId).eq("job_id", jobId);
    }
  }

  // Stats
  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = Object.values(statuses).filter((v) => v === s).length;
    return acc;
  }, {} as Record<Status, number>);

  return (
    <main style={{ minHeight: "100vh", background: "#04070D", color: "white", fontFamily: "system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <a href="/" style={{ fontWeight: 900, fontSize: 20, color: "white", textDecoration: "none" }}>
          Link<span style={{ color: "#0A79A4" }}>GH</span>
        </a>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <a href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>Home</a>
          <a href="/dashboard" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "8px 16px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Dashboard</a>
          <a href="/profile" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>Profile / CV</a>
          <button
            onClick={async () => { await supabase.auth.signOut(); localStorage.removeItem("linkgh_saved_jobs"); window.location.href = "/login"; }}
            style={{ background: "#8B0000", color: "white", border: "none", padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* Welcome banner */}
        <div style={{ background: "linear-gradient(135deg, rgba(10,121,164,0.25), rgba(255,255,255,0.03))", border: "1px solid rgba(10,121,164,0.3)", borderRadius: 20, padding: "28px 32px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Welcome back</p>
            <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>{userName}</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 4, fontSize: 14, margin: 0 }}>{userEmail}</p>
          </div>
          <a href="/profile" style={{ background: "#0A79A4", color: "white", padding: "10px 20px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>Upload CV</a>
        </div>

        {/* Stats row */}
        {savedJobs.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
            {(["Applied", "Interview", "Offer"] as Status[]).map((s) => (
              <div key={s} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 20px", flex: 1, minWidth: 100 }}>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: STATUS_COLORS[s].color }}>{counts[s]}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s}</p>
              </div>
            ))}
          </div>
        )}

        {/* Saved jobs list */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Saved Jobs</h1>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: 20 }}>{savedJobs.length} saved</span>
        </div>

        {savedJobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20 }}>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>No saved jobs yet</p>
            <a href="/" style={{ background: "#0A79A4", color: "white", padding: "10px 24px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>Browse Jobs</a>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {savedJobs.map((job: any) => {
              const jobId = String(job.id);
              const status: Status = statuses[jobId] ?? "Saved";
              const colors = STATUS_COLORS[status];
              return (
                <div key={jobId} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <a href={"/jobs/" + job.id} style={{ textDecoration: "none", color: "white", flex: 1, minWidth: 180 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#0A79A4", textTransform: "uppercase", letterSpacing: "0.06em" }}>{job.category}</span>
                    <h2 style={{ fontSize: 19, fontWeight: 800, margin: "6px 0 4px" }}>{job.title}</h2>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: 0 }}>{job.company} · {job.location}</p>
                  </a>

                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    {/* Status badge label */}
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: colors.bg, color: colors.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {status}
                    </span>

                    {/* Status select */}
                    <select
                      value={status}
                      disabled={savingStatus[jobId]}
                      onChange={(e) => updateStatus(jobId, e.target.value as Status)}
                      style={{ background: "#111827", color: "white", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 12px", borderRadius: 10, fontSize: 13, cursor: "pointer", opacity: savingStatus[jobId] ? 0.5 : 1 }}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Remove */}
                    <button
                      onClick={() => removeJob(jobId)}
                      style={{ background: "rgba(139,0,0,0.3)", color: "#FF6B6B", border: "1px solid rgba(139,0,0,0.4)", padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                    >
                      Remove
                     </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
