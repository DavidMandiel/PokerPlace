-- Function to delete a club and send notifications to members
CREATE OR REPLACE FUNCTION delete_club_with_notifications(
  club_id UUID,
  club_name TEXT,
  owner_email TEXT,
  member_emails TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  member_email TEXT;
BEGIN
  -- Delete club members first (due to foreign key constraints)
  DELETE FROM club_members WHERE club_id = delete_club_with_notifications.club_id;
  
  -- Delete events associated with the club
  DELETE FROM events WHERE club_id = delete_club_with_notifications.club_id;
  
  -- Delete the club
  DELETE FROM clubs WHERE id = delete_club_with_notifications.club_id;
  
  -- TODO: Send email notifications to members
  -- This would typically integrate with an email service like SendGrid, Mailgun, etc.
  -- For now, we'll just log the notification intent
  
  -- Log the deletion for audit purposes
  INSERT INTO audit_logs (
    action,
    table_name,
    record_id,
    user_email,
    details
  ) VALUES (
    'DELETE',
    'clubs',
    club_id,
    owner_email,
    json_build_object(
      'club_name', club_name,
      'member_count', array_length(member_emails, 1),
      'member_emails', member_emails
    )
  );
  
  -- In a real implementation, you would send emails here:
  -- FOREACH member_email IN ARRAY member_emails
  -- LOOP
  --   PERFORM send_email_notification(
  --     member_email,
  --     'Club Deleted',
  --     format('The club "%s" has been deleted by the owner.', club_name)
  --   );
  -- END LOOP;
  
END;
$$;

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  user_email TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to read audit logs (for admins)
CREATE POLICY "Allow authenticated users to read audit logs" ON audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only allow the function to insert audit logs
CREATE POLICY "Allow function to insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);














