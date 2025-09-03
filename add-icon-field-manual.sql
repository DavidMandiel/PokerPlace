-- Run this SQL in your Supabase SQL Editor to add the icon field
-- Go to your Supabase dashboard -> SQL Editor -> New Query -> Paste this and run

-- Add icon field to clubs table if it doesn't exist
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS icon TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clubs' AND column_name = 'icon';

-- Check if any clubs have icon data
SELECT id, name, icon FROM public.clubs LIMIT 5;










