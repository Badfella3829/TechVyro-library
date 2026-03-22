-- Create site_settings table for storing app configuration
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read (some settings like testimonials/folders are public)
CREATE POLICY "Allow public read on site_settings" ON site_settings
  FOR SELECT USING (true);

-- Allow insert/update (admin handles auth at API level)
CREATE POLICY "Allow upsert on site_settings" ON site_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on site_settings" ON site_settings
  FOR UPDATE USING (true);
