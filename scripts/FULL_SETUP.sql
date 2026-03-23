-- ============================================================
-- TechVyro Library — COMPLETE DATABASE SETUP (A to Z)
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. CATEGORIES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#8B5CF6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO categories (name, slug, color) VALUES
  ('Technology', 'technology', '#3B82F6'),
  ('Business', 'business', '#10B981'),
  ('Education', 'education', '#8B5CF6'),
  ('Health', 'health', '#EC4899'),
  ('Science', 'science', '#F59E0B')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- 2. PDFS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1) DEFAULT NULL,
  review_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT NULL,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
  scheduled_at TIMESTAMPTZ DEFAULT NULL,
  allow_download BOOLEAN DEFAULT TRUE,
  slug TEXT DEFAULT NULL,
  structure_location JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pdfs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read access on pdfs" ON pdfs FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS pdfs_slug_unique ON pdfs(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pdfs_category_id ON pdfs(category_id);
CREATE INDEX IF NOT EXISTS idx_pdfs_created_at ON pdfs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pdfs_view_count ON pdfs(view_count DESC);
CREATE INDEX IF NOT EXISTS pdfs_tags_idx ON pdfs USING GIN(tags);
CREATE INDEX IF NOT EXISTS pdfs_visibility_idx ON pdfs(visibility);
CREATE INDEX IF NOT EXISTS pdfs_scheduled_at_idx ON pdfs(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS pdfs_structure_location_idx ON pdfs USING GIN(structure_location);

-- ─────────────────────────────────────────────
-- 3. REVIEWS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pdf_id UUID NOT NULL REFERENCES pdfs(id) ON DELETE CASCADE,
  user_name VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read on reviews" ON reviews FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow insert on reviews" ON reviews FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_pdf_id ON reviews(pdf_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

CREATE OR REPLACE FUNCTION update_pdf_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pdfs
  SET
    average_rating = (SELECT AVG(rating)::DECIMAL(2,1) FROM reviews WHERE pdf_id = COALESCE(NEW.pdf_id, OLD.pdf_id)),
    review_count = (SELECT COUNT(*) FROM reviews WHERE pdf_id = COALESCE(NEW.pdf_id, OLD.pdf_id))
  WHERE id = COALESCE(NEW.pdf_id, OLD.pdf_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pdf_review_stats ON reviews;
CREATE TRIGGER trigger_update_pdf_review_stats
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_pdf_review_stats();

-- ─────────────────────────────────────────────
-- 4. QUIZ TABLES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  time_limit INTEGER DEFAULT 1200,
  questions JSONB DEFAULT '[]',
  enabled BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
  section TEXT DEFAULT 'General',
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  structure_location JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  score DECIMAL(10,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  correct INTEGER DEFAULT 0,
  wrong INTEGER DEFAULT 0,
  skipped INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  quiz_id TEXT REFERENCES quizzes(id) ON DELETE SET NULL,
  quiz_title TEXT DEFAULT '',
  user_id TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read on quizzes" ON quizzes FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow insert on quizzes" ON quizzes FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow update on quizzes" ON quizzes FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow delete on quizzes" ON quizzes FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public insert on quiz_results" ON quiz_results FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read on quiz_results" ON quiz_results FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow delete on quiz_results" ON quiz_results FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_quizzes_enabled ON quizzes(enabled);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_percentage ON quiz_results(percentage DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at ON quiz_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);

-- ─────────────────────────────────────────────
-- 5. SITE SETTINGS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  "key" TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read on site_settings" ON site_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow upsert on site_settings" ON site_settings FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow update on site_settings" ON site_settings FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────
-- 6. PDF FAVORITES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pdf_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT,
  user_id TEXT DEFAULT NULL,
  pdf_id UUID REFERENCES pdfs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pdf_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on pdf_favorites" ON pdf_favorites;
CREATE POLICY "Allow all on pdf_favorites" ON pdf_favorites
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pdf_favorites_device_id ON pdf_favorites(device_id);
CREATE INDEX IF NOT EXISTS idx_pdf_favorites_user_id ON pdf_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_favorites_pdf_id ON pdf_favorites(pdf_id);

-- ─────────────────────────────────────────────
-- 7. RELOAD SCHEMA CACHE (fixes "schema cache" errors)
-- ─────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ─────────────────────────────────────────────
-- DONE! All tables created successfully.
-- ─────────────────────────────────────────────
