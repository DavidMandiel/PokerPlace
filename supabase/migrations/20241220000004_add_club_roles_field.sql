-- Add roles field to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS roles TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN clubs.roles IS 'Club roles and responsibilities (max 200 characters)';
