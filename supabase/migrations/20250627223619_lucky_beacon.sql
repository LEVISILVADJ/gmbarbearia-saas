/*
  # Adicionar configurações do WhatsApp

  1. Updates
    - Adicionar campos para API do WhatsApp nas configurações do negócio
    - whatsapp_api_key (text)
    - whatsapp_phone_number (text)
    - whatsapp_enabled (boolean)

  2. Security
    - Manter as políticas existentes
*/

-- Add WhatsApp configuration fields to business_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'whatsapp_api_key'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN whatsapp_api_key text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'whatsapp_phone_number'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN whatsapp_phone_number text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'whatsapp_enabled'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN whatsapp_enabled boolean DEFAULT false;
  END IF;
END $$;

-- Update existing business settings with default WhatsApp values
UPDATE business_settings 
SET 
  whatsapp_enabled = false,
  whatsapp_phone_number = '',
  whatsapp_api_key = ''
WHERE whatsapp_enabled IS NULL;