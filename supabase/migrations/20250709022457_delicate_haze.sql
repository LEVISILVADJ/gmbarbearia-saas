/*
  # Add color columns to business_settings table

  1. Changes
    - Add `primary_color` column (text, default '#f59e0b')
    - Add `secondary_color` column (text, default '#ea580c')

  2. Notes
    - These columns are used for customizing the barbershop's brand colors
    - Default values match the existing theme colors used in the application
    - Both columns are nullable to maintain flexibility
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