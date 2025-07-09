/*
  # Add Color Columns to Business Settings

  1. Updates
    - Add primary_color column to business_settings table
    - Add secondary_color column to business_settings table
    - Set default values that match the existing theme
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