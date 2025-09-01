-- Add icon field to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS icon TEXT;

-- Create storage bucket for club assets if it doesn't exist
-- Note: This would typically be done through the Supabase dashboard
-- or using the Supabase CLI, but we'll include it here for reference

-- Storage bucket policies (these would be set up in the Supabase dashboard)
-- The bucket 'club-assets' should be created with the following policies:

-- Policy for uploading club icons (authenticated users can upload)
-- CREATE POLICY "Allow authenticated users to upload club icons" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'club-assets' AND 
--     auth.role() = 'authenticated' AND
--     (storage.foldername(name))[1] = 'club-icons'
--   );

-- Policy for viewing club icons (public read access)
-- CREATE POLICY "Allow public to view club icons" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'club-assets' AND 
--     (storage.foldername(name))[1] = 'club-icons'
--   );

-- Policy for updating club icons (club owners only)
-- CREATE POLICY "Allow club owners to update club icons" ON storage.objects
--   FOR UPDATE USING (
--     bucket_id = 'club-assets' AND 
--     auth.role() = 'authenticated' AND
--     (storage.foldername(name))[1] = 'club-icons'
--   );

-- Policy for deleting club icons (club owners only)
-- CREATE POLICY "Allow club owners to delete club icons" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'club-assets' AND 
--     auth.role() = 'authenticated' AND
--     (storage.foldername(name))[1] = 'club-icons'
--   );





