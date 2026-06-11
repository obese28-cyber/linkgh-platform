import jobsData from "@/data/jobs.json";

const jobs: any[] = Array.isArray(jobsData)
  ? jobsData
  : Array.isArray((jobsData as any).default)
  ? (jobsData as any).default
  : Object.values(jobsData || {});

export default async function JobDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = jobs.find((j: any) => j.id === Number(id));

  if (!job) {
    return <div style={{ padding: 40, color: "white" }}>Job not found</div>;
  }

  const relatedJobs = jobs
    .filter((j: any) => j.category === job.category && j.id !== job.id)
    .slice(0, 3);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#04070D",
        color: "white",
        padding: "60px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          padding: 40,
          backdropFilter: "blur(20px)",
        }}
      >
        <p style={{ color: "#0A79A4", fontWeight: 700, marginBottom: 12 }}>
          {job.category}
        </p>

        <h1 style={{ fontSize: 42, fontWeight: 900, marginBottom: 12 }}>
          {job.title}
        </h1>

        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginBottom: 30 }}>
          {job.company} · {job.location}
        </p>

        <div style={{ display: "flex", gap: 12, marginBottom: 30, flexWrap: "wrap" }}>
          <span style={{ background: "rgba(10,121,164,0.2)", padding: "8px 14px", borderRadius: 10, marginRight: 8 }}>
            {job.type}
          </span>
          <span style={{ background: "rgba(33,151,119,0.2)", padding: "8px 14px", borderRadius: 10 }}>
            Verified
          </span>
        </div>

        <p style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 40 }}>
          LinkGH verified opportunity for professionals in Ghana.
          Apply directly through the official employer platform.
        </p>

        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            background: "#0A79A4",
            padding: "14px 28px",
            borderRadius: 12,
            color: "white",
            textDecoration: "none",
            fontWeight: 700,
            marginBottom: 60,
          }}
        >
          Apply on Company Website ↗
        </a>

        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>
            Related Jobs
          </h2>
          <div style={{ display: "grid", gap: 20 }}>
            {relatedJobs.map((related: any) => (
              <a
                key={related.id}
                href={"/jobs/" + related.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: 24,
                  borderRadius: 18,
                  textDecoration: "none",
                  color: "white",
                  display: "block",
                }}
              >
                <h3 style={{ fontSize: 20, marginBottom: 8 }}>{related.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.6)" }}>
                  {related.company} · {related.location}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
