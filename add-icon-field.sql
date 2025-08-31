-- Add icon field to clubs table if it doesn't exist
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS icon TEXT;

