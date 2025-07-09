/*
  # Remove Birthday Module

  1. Changes
    - Remove birth_date column from clients table
    - Drop birthday_messages table
    - Remove related indexes and functions
*/

-- Drop birthday_messages table if it exists
DROP TABLE IF EXISTS birthday_messages;

-- Remove birth_date column from clients table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE clients DROP COLUMN birth_date;
  END IF;
END $$;

-- Drop the birthday check function if it exists
DROP FUNCTION IF EXISTS check_birthdays();

-- Drop the birth_date index if it exists
DROP INDEX IF EXISTS idx_clients_birth_date;