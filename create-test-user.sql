-- Create a test user for dashboard testing
-- Run this in your Supabase SQL Editor

-- First, let's clean up any existing test user
DELETE FROM public.user_profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'test@example.com'
);
DELETE FROM auth.users WHERE email = 'test@example.com';

-- Insert into auth.users (this simulates a user created through Supabase Auth)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'test@mailinator.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"first_name": "John", "last_name": "Doe", "nickname": "PokerKing", "country": "Israel", "city": "Tel Aviv"}',
  false,
  '',
  '',
  '',
  ''
);

-- Get the user ID we just created and create test data
DO $$
DECLARE
    user_id uuid;
    club_id uuid;
BEGIN
    -- Get the user ID we just created
    SELECT id INTO user_id FROM auth.users WHERE email = 'test@example.com' LIMIT 1;
    
    -- Create a test club for the user to manage
    INSERT INTO public.clubs (
      id,
      name,
      slug,
      description,
      city,
      visibility,
      owner_id,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      'Tel Aviv Poker Club',
      'tel-aviv-poker-club',
      'A friendly poker club in Tel Aviv for casual and tournament players.',
      'Tel Aviv',
      'public',
      user_id,
      now(),
      now()
    ) RETURNING id INTO club_id;
    
    -- Add the user as a member of their own club
    INSERT INTO public.club_members (
      club_id,
      user_id,
      role,
      joined_at
    ) VALUES (
      club_id,
      user_id,
      'admin',
      now()
    );
    
    RAISE NOTICE 'Test user created with ID: %', user_id;
    RAISE NOTICE 'Test club created with ID: %', club_id;
END $$;

-- Display the test user info
SELECT 
  'Test User Created Successfully!' as message,
  'Email: test@example.com' as email,
  'Password: password123' as password;
