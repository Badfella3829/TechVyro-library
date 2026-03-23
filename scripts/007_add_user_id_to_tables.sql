-- Add user_id to quiz_results for linking results to logged-in users
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT NULL;

-- Add user_id to pdf_favorites for cross-device favorites for logged-in users
ALTER TABLE pdf_favorites ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT NULL;

-- Indexes for fast user-scoped queries
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_favorites_user_id ON pdf_favorites(user_id);
