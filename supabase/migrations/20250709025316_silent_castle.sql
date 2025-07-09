/*
  # Add Theme Mode to Business Settings

  1. Updates
    - Add theme_mode column to business_settings table
    - Set default theme mode to 'dark'
    - Update existing records to have the default theme mode if null
*/

-- Add theme_mode column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'theme_mode'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN theme_mode text DEFAULT 'dark';
  END IF;
END $$;

-- Update existing records to have the default theme mode if null
UPDATE business_settings
SET theme_mode = 'dark'
WHERE theme_mode IS NULL;

-- Ensure the column has a check constraint for valid values
ALTER TABLE business_settings 
  DROP CONSTRAINT IF EXISTS business_settings_theme_mode_check;

ALTER TABLE business_settings
  ADD CONSTRAINT business_settings_theme_mode_check 
  CHECK (theme_mode IN ('dark', 'light'));