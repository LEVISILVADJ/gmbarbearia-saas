/*
  # Add Description and Footer Address Fields

  1. Updates
    - Add description column to business_settings table
    - Add footer_address column to business_settings table
    - Update existing records with default values
    - Ensure these fields are separate from the address field

  2. Purpose
    - Fix the issue where editing the address in the footer also changes the description in the About section
    - Allow separate management of these two fields
*/

-- Add description column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'description'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN description text;
  END IF;
END $$;

-- Add footer_address column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'footer_address'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN footer_address text;
  END IF;
END $$;

-- Update existing records to have the default values if null
UPDATE business_settings
SET 
  description = 'Com mais de 10 anos de experiência, a GM Barbearia é referência em cortes masculinos na região. Combinamos técnicas tradicionais com tendências modernas para oferecer o melhor serviço aos nossos clientes.',
  footer_address = SPLIT_PART(address, ',', 1)
WHERE 
  description IS NULL OR 
  footer_address IS NULL;