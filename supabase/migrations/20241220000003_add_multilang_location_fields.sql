-- Add multi-language location fields to user_profiles table
-- This migration adds support for storing location data in both English and local languages

-- Add English language fields
ALTER TABLE user_profiles ADD COLUMN city_en VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN state_en VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN country_en VARCHAR(255);

-- Add local language fields
ALTER TABLE user_profiles ADD COLUMN city_local VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN state_local VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN country_local VARCHAR(255);

-- Add country code for standardized filtering
ALTER TABLE user_profiles ADD COLUMN country_code VARCHAR(2);

-- Add coordinates for location-based features
ALTER TABLE user_profiles ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE user_profiles ADD COLUMN longitude DECIMAL(11, 8);

-- Create indexes for better search performance
CREATE INDEX idx_user_profiles_city_en ON user_profiles(city_en);
CREATE INDEX idx_user_profiles_city_local ON user_profiles(city_local);
CREATE INDEX idx_user_profiles_country_code ON user_profiles(country_code);
CREATE INDEX idx_user_profiles_country_en ON user_profiles(country_en);
CREATE INDEX idx_user_profiles_country_local ON user_profiles(country_local);

-- Create a composite index for location-based searches
CREATE INDEX idx_user_profiles_location_search ON user_profiles(city_en, city_local, country_code);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.city_en IS 'City name in English for searching and filtering';
COMMENT ON COLUMN user_profiles.city_local IS 'City name in local language for display';
COMMENT ON COLUMN user_profiles.state_en IS 'State/Province name in English for searching and filtering';
COMMENT ON COLUMN user_profiles.state_local IS 'State/Province name in local language for display';
COMMENT ON COLUMN user_profiles.country_en IS 'Country name in English for searching and filtering';
COMMENT ON COLUMN user_profiles.country_local IS 'Country name in local language for display';
COMMENT ON COLUMN user_profiles.country_code IS 'ISO 2-letter country code (e.g., US, IL, GB)';
COMMENT ON COLUMN user_profiles.latitude IS 'Latitude coordinate for location-based features';
COMMENT ON COLUMN user_profiles.longitude IS 'Longitude coordinate for location-based features';

-- Update RLS policies to include new fields
-- The existing policies should automatically include the new columns, but let's ensure they're covered
-- by updating the policy to be more explicit about column access

-- Drop and recreate the select policy to be more explicit
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Drop and recreate the update policy to be more explicit
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Drop and recreate the insert policy to be more explicit
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a function to populate multi-language fields from existing data
CREATE OR REPLACE FUNCTION populate_multilang_location_fields()
RETURNS void AS $$
BEGIN
  -- Update existing records to populate the new fields
  -- For now, we'll copy the existing values to both English and local fields
  -- The application will handle proper translation when users update their profiles
  
  UPDATE user_profiles 
  SET 
    city_en = COALESCE(city, ''),
    city_local = COALESCE(city, ''),
    state_en = COALESCE(state, ''),
    state_local = COALESCE(state, ''),
    country_en = COALESCE(country, ''),
    country_local = COALESCE(country, ''),
    country_code = CASE 
      WHEN LOWER(country) LIKE '%israel%' OR country LIKE '%ישראל%' THEN 'IL'
      WHEN LOWER(country) LIKE '%united states%' OR LOWER(country) LIKE '%usa%' OR LOWER(country) LIKE '%america%' THEN 'US'
      WHEN LOWER(country) LIKE '%united kingdom%' OR LOWER(country) LIKE '%britain%' OR LOWER(country) LIKE '%england%' THEN 'GB'
      WHEN LOWER(country) LIKE '%france%' THEN 'FR'
      WHEN LOWER(country) LIKE '%germany%' THEN 'DE'
      WHEN LOWER(country) LIKE '%italy%' THEN 'IT'
      WHEN LOWER(country) LIKE '%spain%' THEN 'ES'
      WHEN LOWER(country) LIKE '%russia%' THEN 'RU'
      WHEN LOWER(country) LIKE '%japan%' THEN 'JP'
      WHEN LOWER(country) LIKE '%china%' THEN 'CN'
      ELSE ''
    END
  WHERE city_en IS NULL OR city_en = '';
  
  RAISE NOTICE 'Multi-language location fields populated for existing records';
END;
$$ LANGUAGE plpgsql;

-- Execute the function to populate existing data
SELECT populate_multilang_location_fields();

-- Drop the temporary function
DROP FUNCTION populate_multilang_location_fields();
