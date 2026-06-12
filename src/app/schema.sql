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

-- ─────────────────────────────────────────────────────────────────────────────
-- User profiles (mirrors Supabase auth.users via user_id)
-- Run against Supabase: paste into SQL editor or use supabase db push
-- ─────────────────────────────────────────────────────────────────────────────

-- profiles table (one row per auth user)
CREATE TABLE IF NOT EXISTS profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name      TEXT,
  phone          TEXT,
  linkedin       TEXT,
  location       TEXT,
  bio            TEXT,
  cv_filename    TEXT,
  cv_uploaded_at TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Row-Level Security: users can only read/write their own row
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: own row select" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles: own row insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: own row update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create a blank profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- Saved jobs (one row per user × job)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saved_jobs (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    UUID    NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  job_id     TEXT    NOT NULL,
  saved_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, job_id)
);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_jobs: own rows select" ON saved_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_jobs: own rows insert" ON saved_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_jobs: own rows delete" ON saved_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Application status tracking (one row per user × job)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS application_statuses (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    UUID    NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  job_id     TEXT    NOT NULL,   -- matches job.id from jobs.json / D1
  status     TEXT    NOT NULL DEFAULT 'Saved'
               CHECK (status IN ('Saved','Applied','Interview','Offer','Rejected')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, job_id)
);

ALTER TABLE application_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_statuses: own rows select" ON application_statuses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "app_statuses: own rows insert" ON application_statuses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "app_statuses: own rows update" ON application_statuses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "app_statuses: own rows delete" ON application_statuses
  FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
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
