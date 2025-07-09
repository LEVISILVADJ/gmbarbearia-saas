/*
  # Fix Business Settings Table

  1. Updates
    - Ensure primary_color and secondary_color columns exist
    - Set default values for these columns
    - Update existing records with default colors if they're null
    - Create a function to get business settings safely
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

-- Create a function to safely get business settings
CREATE OR REPLACE FUNCTION get_business_settings()
RETURNS SETOF business_settings AS $$
DECLARE
  settings business_settings;
BEGIN
  -- Try to get existing settings
  SELECT * INTO settings FROM business_settings ORDER BY created_at DESC LIMIT 1;
  
  -- If no settings exist, create default settings
  IF settings IS NULL THEN
    INSERT INTO business_settings (
      business_name, 
      phone, 
      email, 
      address, 
      logo_url, 
      primary_color,
      secondary_color
    ) VALUES (
      'GM Barbearia', 
      '(11) 99999-9999', 
      'contato@gmbarbearia.com', 
      'Rua das Flores, 123 - Centro, São Paulo - SP',
      '/WhatsApp Image 2025-06-26 at 08.22.png',
      '#f59e0b',
      '#ea580c'
    ) RETURNING * INTO settings;
  END IF;
  
  RETURN NEXT settings;
END;
$$ LANGUAGE plpgsql;

-- Comment on the function
COMMENT ON FUNCTION get_business_settings() IS 'Safely retrieves business settings, creating default settings if none exist';