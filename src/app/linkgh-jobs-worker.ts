/**
 * LinkGH Jobs Worker
 * Cloudflare Worker — handles:
 *   GET  /api/jobs          → serve jobs to frontend
 *   POST /api/jobs/refresh  → manual trigger (admin)
 *   Cron trigger            → scheduled job ingestion
 */

export interface Env {
  DB: D1Database;
  JSEARCH_API_KEY: string;
  JSEARCH_API_HOST: string;
  ADMIN_SECRET: string;
  ENVIRONMENT: string;
}

/* ─── D1 row shape ───────────────────────────────────────────────────────── */
interface JobRow {
  id: number;
  external_id: string;
  title: string;
  company: string;
  location: string;
  job_type: string | null;
  description: string | null;
  salary: string | null;
  deadline: string | null;
  apply_url: string;
  is_verified: number;
  category: string;
  is_active: number;
  found_at: string;
  expires_at: string | null;
}

/* ─── JSearch API response shape (simplified) ───────────────────────────── */
interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city: string | null;
  job_country: string | null;
  job_employment_type: string | null;
  job_description: string | null;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_apply_link: string;
  job_posted_at_timestamp: number | null;
  job_offer_expiration_timestamp: number | null;
  job_is_remote: boolean;
}

/* ─── search queries per category ───────────────────────────────────────── */
const SEARCH_QUERIES: { query: string; category: string }[] = [
  { query: "Accounting jobs Ghana",      category: "Accounting"        },
  { query: "Audit jobs Ghana",           category: "Audit"             },
  { query: "Bookkeeping jobs Ghana",     category: "Bookkeeping"       },
  { query: "Finance jobs Ghana",         category: "Finance"           },
  { query: "Banking jobs Ghana",         category: "Banking"           },
  { query: "Tax jobs Ghana",             category: "Tax"               },
  { query: "Healthcare jobs Ghana",      category: "Healthcare"        },
  { query: "Technology jobs Ghana",      category: "Technology"        },
  { query: "Engineering jobs Ghana",     category: "Engineering"       },
  { query: "NGO jobs Ghana",             category: "NGO"               },
  { query: "Administration jobs Ghana",  category: "Administration"    },
  { query: "Sales Marketing jobs Ghana", category: "Sales & Marketing" },
  { query: "Remote jobs Ghana",          category: "Remote Jobs"       },
  { query: "Logistics jobs Ghana",       category: "Logistics"         },
  { query: "Hospitality jobs Ghana",     category: "Hospitality"       },
  { query: "Government jobs Ghana",      category: "Government"        },
  { query: "Customer Service jobs Ghana",category: "Customer Service"  },
];

/* ─── helpers ────────────────────────────────────────────────────────────── */
function normaliseJobType(raw: string | null): string {
  if (!raw) return "Full-time";
  const u = raw.toUpperCase();
  if (u.includes("PART"))     return "Part-time";
  if (u.includes("CONTRACT")) return "Contract";
  if (u.includes("INTERN"))   return "Internship";
  if (u.includes("REMOTE"))   return "Remote";
  return "Full-time";
}

function buildSalaryString(job: JSearchJob): string | null {
  if (!job.job_min_salary && !job.job_max_salary) return null;
  const cur  = job.job_salary_currency ?? "GHS";
  const per  = job.job_salary_period   ?? "MONTH";
  const perLabel: Record<string, string> = {
    MONTH: "/month", YEAR: "/year", HOUR: "/hour", WEEK: "/week",
  };
  const suffix = perLabel[per.toUpperCase()] ?? "";
  if (job.job_min_salary && job.job_max_salary) {
    return `${cur} ${job.job_min_salary.toLocaleString()}–${job.job_max_salary.toLocaleString()}${suffix}`;
  }
  const val = job.job_min_salary ?? job.job_max_salary;
  return `${cur} ${val?.toLocaleString()}${suffix}`;
}

function dedupeKey(title: string, company: string, location: string): string {
  return [title, company, location]
    .map((s) => s.toLowerCase().trim().replace(/\s+/g, " "))
    .join("|");
}

function deadlineLabel(isoDate: string | null): string | null {
  if (!isoDate) return null;
  const ms   = new Date(isoDate).getTime() - Date.now();
  const days = Math.ceil(ms / 86_400_000);
  if (days < 0)  return null;
  if (days === 0) return "Closes today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

/* ─── fetch one page from JSearch ───────────────────────────────────────── */
async function fetchJSearchPage(
  query: string,
  page: number,
  env: Env
): Promise<JSearchJob[]> {
  const url = new URL("https://jsearch.p.rapidapi.com/search");
  url.searchParams.set("query",           query);
  url.searchParams.set("page",            String(page));
  url.searchParams.set("num_pages",       "1");
  url.searchParams.set("date_posted",     "month");
  url.searchParams.set("country",         "gh");
  url.searchParams.set("language",        "en");

  const res = await fetch(url.toString(), {
    headers: {
      "X-RapidAPI-Key":  env.JSEARCH_API_KEY,
      "X-RapidAPI-Host": env.JSEARCH_API_HOST ?? "jsearch.p.rapidapi.com",
    },
  });

  if (!res.ok) {
    console.error(`JSearch error ${res.status} for query: ${query}`);
    return [];
  }

  const data = (await res.json()) as { data?: JSearchJob[] };
  return data.data ?? [];
}

/* ─── ingest one category ────────────────────────────────────────────────── */
async function ingestCategory(
  query: string,
  category: string,
  env: Env
): Promise<{ inserted: number; skipped: number }> {
  const jobs = await fetchJSearchPage(query, 1, env);
  let inserted = 0;
  let skipped  = 0;

  for (const j of jobs) {
    if (!j.job_apply_link || !j.job_title || !j.employer_name) continue;

    const location = [j.job_city, "Ghana"].filter(Boolean).join(", ");
    const key      = dedupeKey(j.job_title, j.employer_name, location);

    /* duplicate check */
    const existing = await env.DB
      .prepare("SELECT id FROM jobs WHERE dedupe_key = ?")
      .bind(key)
      .first<{ id: number }>();

    if (existing) { skipped++; continue; }

    const expiresAt = j.job_offer_expiration_timestamp
      ? new Date(j.job_offer_expiration_timestamp * 1000).toISOString()
      : null;

    /* skip already-expired */
    if (expiresAt && new Date(expiresAt) < new Date()) { skipped++; continue; }

    await env.DB
      .prepare(`
        INSERT INTO jobs
          (external_id, title, company, location, job_type, description,
           salary, deadline, apply_url, is_verified, category,
           is_active, found_at, expires_at, dedupe_key)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `)
      .bind(
        j.job_id,
        j.job_title,
        j.employer_name,
        location,
        normaliseJobType(j.job_is_remote ? "REMOTE" : j.job_employment_type),
        j.job_description?.slice(0, 1000) ?? null,
        buildSalaryString(j),
        expiresAt,
        j.job_apply_link,
        1,
        category,
        1,
        new Date().toISOString(),
        expiresAt,
        key
      )
      .run();

    inserted++;
  }

  return { inserted, skipped };
}

/* ─── mark expired jobs ──────────────────────────────────────────────────── */
async function markExpired(env: Env): Promise<number> {
  const result = await env.DB
    .prepare(`
      UPDATE jobs
      SET is_active = 0
      WHERE is_active = 1
        AND expires_at IS NOT NULL
        AND expires_at < ?
    `)
    .bind(new Date().toISOString())
    .run();
  return result.meta?.changes ?? 0;
}

/* ─── full ingestion run ─────────────────────────────────────────────────── */
async function runIngestion(env: Env): Promise<Response> {
  const results: Record<string, { inserted: number; skipped: number }> = {};
  let totalInserted = 0;
  let totalSkipped  = 0;

  for (const { query, category } of SEARCH_QUERIES) {
    const r = await ingestCategory(query, category, env);
    results[category] = r;
    totalInserted += r.inserted;
    totalSkipped  += r.skipped;
    /* small delay to respect rate limits */
    await new Promise((res) => setTimeout(res, 300));
  }

  const expired = await markExpired(env);

  return Response.json({
    ok:            true,
    totalInserted,
    totalSkipped,
    expired,
    categories:    results,
    ranAt:         new Date().toISOString(),
  });
}

/* ─── CORS headers ───────────────────────────────────────────────────────── */
function corsHeaders(origin: string): Record<string, string> {
  const allowed = ["https://linkgh.com", "https://www.linkgh.com"];
  const o = allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin":  o,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type":                 "application/json",
  };
}

/* ─── Worker fetch handler ───────────────────────────────────────────────── */
export default {
  /* ── cron ── */
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runIngestion(env));
  },

  /* ── fetch ── */
  async fetch(request: Request, env: Env): Promise<Response> {
    const url    = new URL(request.url);
    const origin = request.headers.get("Origin") ?? "";
    const hdrs   = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: hdrs });
    }

    /* ── GET /api/jobs ── */
    if (request.method === "GET" && url.pathname === "/api/jobs") {
      const category = url.searchParams.get("category") ?? null;
      const page     = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
      const limit    = Math.min(20, parseInt(url.searchParams.get("limit") ?? "20", 10));
      const offset   = (page - 1) * limit;

      let query: D1PreparedStatement;

      if (category && category !== "All") {
        query = env.DB
          .prepare(`
            SELECT id, title, company, location, job_type,
                   salary, expires_at, apply_url, is_verified, category,
                   found_at
            FROM   jobs
            WHERE  is_active = 1
              AND  category  = ?
            ORDER  BY found_at DESC
            LIMIT  ? OFFSET ?
          `)
          .bind(category, limit, offset);
      } else {
        query = env.DB
          .prepare(`
            SELECT id, title, company, location, job_type,
                   salary, expires_at, apply_url, is_verified, category,
                   found_at
            FROM   jobs
            WHERE  is_active = 1
            ORDER  BY found_at DESC
            LIMIT  ? OFFSET ?
          `)
          .bind(limit, offset);
      }

      const rows  = await query.all<JobRow>();
      const total = await env.DB
        .prepare(
          category && category !== "All"
            ? "SELECT COUNT(*) as n FROM jobs WHERE is_active=1 AND category=?"
            : "SELECT COUNT(*) as n FROM jobs WHERE is_active=1"
        )
        .bind(...(category && category !== "All" ? [category] : []))
        .first<{ n: number }>();

      /* shape the response — no internal fields exposed */
      const jobs = (rows.results ?? []).map((j) => ({
        id:          j.id,
        title:       j.title,
        company:     j.company,
        location:    j.location,
        jobType:     j.job_type ?? "Full-time",
        salary:      j.salary   ?? null,
        deadline:    deadlineLabel(j.expires_at),
        applyUrl:    j.apply_url,
        isVerified:  Boolean(j.is_verified),
        category:    j.category,
        postedAt:    j.found_at,
      }));

      return Response.json(
        { ok: true, jobs, total: total?.n ?? 0, page, limit },
        { headers: hdrs }
      );
    }

    /* ── GET /api/jobs/categories ── */
    if (request.method === "GET" && url.pathname === "/api/jobs/categories") {
      const rows = await env.DB
        .prepare(`
          SELECT category, COUNT(*) as count
          FROM   jobs
          WHERE  is_active = 1
          GROUP  BY category
          ORDER  BY count DESC
        `)
        .all<{ category: string; count: number }>();

      return Response.json(
        { ok: true, categories: rows.results ?? [] },
        { headers: hdrs }
      );
    }

    /* ── POST /api/jobs/refresh  (admin only) ── */
    if (request.method === "POST" && url.pathname === "/api/jobs/refresh") {
      const auth = request.headers.get("Authorization") ?? "";
      if (auth !== `Bearer ${env.ADMIN_SECRET}`) {
        return Response.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: hdrs });
      }
      return runIngestion(env);
    }

    return Response.json({ ok: false, error: "Not found" }, { status: 404, headers: hdrs });
  },
};
