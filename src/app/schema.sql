-- ─────────────────────────────────────────────────────────────────────────────
-- LinkGH D1 Schema
-- Run with: wrangler d1 execute linkgh-db --file=schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS jobs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,

  -- external source
  external_id  TEXT NOT NULL,
  dedupe_key   TEXT NOT NULL UNIQUE,  -- title|company|location (normalised)

  -- core fields
  title        TEXT    NOT NULL,
  company      TEXT    NOT NULL,
  location     TEXT    NOT NULL,
  job_type     TEXT    DEFAULT 'Full-time',
  description  TEXT,
  salary       TEXT,

  -- dates
  deadline     TEXT,                  -- human label stored for convenience
  expires_at   TEXT,                  -- ISO 8601, used for expiry cron
  found_at     TEXT    NOT NULL,      -- ISO 8601 when ingested

  -- apply
  apply_url    TEXT    NOT NULL,

  -- trust
  is_verified  INTEGER DEFAULT 1,     -- 1 = AI-checked, never expose source

  -- classification
  category     TEXT    NOT NULL,

  -- status
  is_active    INTEGER DEFAULT 1      -- 0 = expired / removed
);

-- indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_jobs_category   ON jobs (category);
CREATE INDEX IF NOT EXISTS idx_jobs_active     ON jobs (is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs (expires_at);
CREATE INDEX IF NOT EXISTS idx_jobs_found_at   ON jobs (found_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_dedupe     ON jobs (dedupe_key);

-- ingestion log (optional but useful for debugging)
CREATE TABLE IF NOT EXISTS ingestion_logs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ran_at       TEXT    NOT NULL,
  total_inserted INTEGER DEFAULT 0,
  total_skipped  INTEGER DEFAULT 0,
  total_expired  INTEGER DEFAULT 0,
  status       TEXT    DEFAULT 'ok',
  notes        TEXT
);
