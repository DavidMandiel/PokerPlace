-- Add detailed location fields to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS street_number TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Add comments to explain the fields
COMMENT ON COLUMN clubs.street IS 'Street name for the club location';
COMMENT ON COLUMN clubs.street_number IS 'Street number/building number';
COMMENT ON COLUMN clubs.country IS 'Country where the club is located';
COMMENT ON COLUMN clubs.state IS 'State/province/region where the club is located';
COMMENT ON COLUMN clubs.postal_code IS 'Postal/ZIP code for the club location';

-- Update existing clubs to have default values for new fields
UPDATE clubs SET 
  country = COALESCE(country, 'Unknown'),
  state = COALESCE(state, 'Unknown')
WHERE country IS NULL OR state IS NULL;
