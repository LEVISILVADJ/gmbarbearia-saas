/*
  # Fix Business Settings Colors

  1. Updates
    - Add primary_color and secondary_color columns to business_settings table
    - Set default values for these columns
    - Update existing records with default colors
    - Fix issue with ConfiguracaoPG component
*/

-- Add primary_color column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'primary_color'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN primary_color text DEFAULT '#f59e0b';
  END IF;
END $$;

-- Add secondary_color column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'secondary_color'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN secondary_color text DEFAULT '#ea580c';
  END IF;
END $$;

-- Update existing records to have the default colors if they're null
UPDATE business_settings
SET 
  primary_color = '#f59e0b',
  secondary_color = '#ea580c'
WHERE 
  primary_color IS NULL OR 
  secondary_color IS NULL;

-- Fix issue with business_settings.get() returning a single record
-- by ensuring we use maybeSingle() instead of single() for empty tables
CREATE OR REPLACE FUNCTION get_business_settings()
RETURNS SETOF business_settings AS $$
BEGIN
  RETURN QUERY SELECT * FROM business_settings ORDER BY created_at DESC LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Insert a default record if none exists
INSERT INTO business_settings (
  business_name, 
  phone, 
  email, 
  address, 
  logo_url, 
  primary_color,
  secondary_color
)
SELECT 
  'GM Barbearia', 
  '(11) 99999-9999', 
  'contato@gmbarbearia.com', 
  'Rua das Flores, 123 - Centro, São Paulo - SP',
  '/WhatsApp Image 2025-06-26 at 08.22.png',
  '#f59e0b',
  '#ea580c'
WHERE NOT EXISTS (
  SELECT 1 FROM business_settings LIMIT 1
);