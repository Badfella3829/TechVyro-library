-- Add view_count column to pdfs table
ALTER TABLE pdfs 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add unique constraint for title per category to prevent duplicates
ALTER TABLE pdfs 
ADD CONSTRAINT unique_title_per_category UNIQUE (title, category_id);

-- Add max file size check (1GB = 1073741824 bytes)
ALTER TABLE pdfs 
ADD CONSTRAINT check_file_size CHECK (file_size <= 1073741824);

-- Create index for faster view count queries
CREATE INDEX IF NOT EXISTS idx_pdfs_view_count ON pdfs(view_count DESC);
