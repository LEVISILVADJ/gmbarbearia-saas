/*
  # Client Retention System

  1. New Tables
    - `retention_messages`
      - `id` (uuid, primary key)
      - `title` (text)
      - `message_template` (text)
      - `days_inactive` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on retention_messages table
    - Admin can manage all retention messages
    - Authenticated can read retention messages

  3. Features
    - Track clients who haven't returned in X days
    - Send automated WhatsApp messages to inactive clients
    - Configurable message templates and thresholds
*/

-- Create retention_messages table
CREATE TABLE IF NOT EXISTS retention_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message_template text NOT NULL,
  days_inactive integer NOT NULL DEFAULT 60,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE retention_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for retention_messages table
CREATE POLICY "Admin can manage retention messages"
  ON retention_messages
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Authenticated can read retention messages"
  ON retention_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_retention_messages_updated_at 
  BEFORE UPDATE ON retention_messages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default retention message template
INSERT INTO retention_messages (title, message_template, days_inactive, is_active) VALUES
('Mensagem de Retorno - 60 dias', 
'👋 *Olá, {client_name}!*

Sentimos sua falta na GM Barbearia! Já faz mais de 60 dias desde sua última visita.

Que tal agendar um horário para renovar seu visual? Estamos com novidades e promoções especiais para você.

*Oferta Especial de Retorno:* 15% de desconto em qualquer serviço!

Para agendar, é só responder esta mensagem ou acessar nosso site.

Esperamos vê-lo em breve!

Equipe GM Barbearia ✂️', 
60, 
true)
ON CONFLICT DO NOTHING;

-- Create function to check for inactive clients and send messages
CREATE OR REPLACE FUNCTION check_inactive_clients()
RETURNS void AS $$
DECLARE
  client_record RECORD;
  message_record RECORD;
  last_booking_date DATE;
  days_since_last_booking INTEGER;
  formatted_message TEXT;
  whatsapp_enabled BOOLEAN;
BEGIN
  -- Check if WhatsApp is enabled in settings
  SELECT whatsapp_enabled INTO whatsapp_enabled FROM business_settings LIMIT 1;
  
  IF NOT whatsapp_enabled THEN
    RAISE NOTICE 'WhatsApp notifications are disabled in settings';
    RETURN;
  END IF;
  
  -- Get active retention messages
  FOR message_record IN
    SELECT * FROM retention_messages WHERE is_active = true
  LOOP
    -- Find clients who haven't returned in X days
    FOR client_record IN
      SELECT c.* FROM clients c
      WHERE EXISTS (
        -- Client has at least one booking
        SELECT 1 FROM bookings b 
        WHERE b.client_id = c.id
      )
      AND NOT EXISTS (
        -- Client doesn't have any bookings in the last X days
        SELECT 1 FROM bookings b 
        WHERE b.client_id = c.id
        AND b.booking_date > (CURRENT_DATE - message_record.days_inactive)
      )
    LOOP
      -- Get last booking date for this client
      SELECT MAX(booking_date) INTO last_booking_date
      FROM bookings
      WHERE client_id = client_record.id;
      
      IF last_booking_date IS NOT NULL THEN
        days_since_last_booking := CURRENT_DATE - last_booking_date;
        
        -- Format message with client name
        formatted_message := REPLACE(message_record.message_template, '{client_name}', client_record.name);
        formatted_message := REPLACE(formatted_message, '{days_inactive}', days_since_last_booking::text);
        
        -- In a real implementation, this would call a function to send the WhatsApp message
        -- For now, we'll just log it
        RAISE NOTICE 'Retention message would be sent to % (phone: %): %', 
          client_record.name, client_record.phone, formatted_message;
        
        -- Here you would call your WhatsApp sending function
        -- This is a placeholder for the actual implementation
        -- send_whatsapp_message(client_record.phone, formatted_message);
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a comment explaining how to use the retention check function
COMMENT ON FUNCTION check_inactive_clients() IS 
'Function to check for inactive clients and send WhatsApp messages.
This can be called manually or scheduled to run weekly using a cron job.
Example usage: SELECT check_inactive_clients();';

-- Add last_visit_date column to clients table for easier querying
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'last_visit_date'
  ) THEN
    ALTER TABLE clients ADD COLUMN last_visit_date date;
  END IF;
END $$;

-- Create function to update last_visit_date when a booking is completed
CREATE OR REPLACE FUNCTION update_client_last_visit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'concluido' THEN
    UPDATE clients
    SET last_visit_date = NEW.booking_date
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_visit_date
CREATE TRIGGER update_client_last_visit_trigger
AFTER UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_client_last_visit();

-- Add index for better performance on last_visit_date queries
CREATE INDEX IF NOT EXISTS idx_clients_last_visit ON clients(last_visit_date);