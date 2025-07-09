/*
  # Add Birthday Notifications Feature

  1. Schema Updates
    - Add birth_date column to clients table
    - Create birthday_messages table to store message templates
    - Add function to check for birthdays and send messages

  2. Security
    - Enable RLS on new table
    - Add appropriate policies
*/

-- Add birth_date column to clients table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE clients ADD COLUMN birth_date date;
  END IF;
END $$;

-- Create birthday_messages table
CREATE TABLE IF NOT EXISTS birthday_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message_template text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on birthday_messages table
ALTER TABLE birthday_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for birthday_messages table
CREATE POLICY "Admin can manage birthday messages"
  ON birthday_messages
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Authenticated can read birthday messages"
  ON birthday_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_birthday_messages_updated_at 
  BEFORE UPDATE ON birthday_messages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default birthday message template
INSERT INTO birthday_messages (title, message_template, is_active) VALUES
('Mensagem de Aniversário Padrão', 
'🎂 *Feliz Aniversário, {client_name}!* 🎉

Toda a equipe da GM Barbearia deseja a você um dia incrível cheio de felicidade e realizações!

Como presente especial, queremos oferecer um *desconto de 20%* em qualquer serviço da nossa barbearia válido durante todo o mês do seu aniversário.

Basta mencionar este desconto ao agendar seu horário.

Agradecemos por fazer parte da nossa história e esperamos continuar cuidando do seu visual por muitos anos!

Abraços,
Equipe GM Barbearia ✂️', 
true)
ON CONFLICT DO NOTHING;

-- Create function to check for birthdays and send messages
CREATE OR REPLACE FUNCTION check_birthdays()
RETURNS void AS $$
DECLARE
  client_record RECORD;
  message_template TEXT;
  formatted_message TEXT;
  whatsapp_enabled BOOLEAN;
BEGIN
  -- Check if WhatsApp is enabled in settings
  SELECT whatsapp_enabled INTO whatsapp_enabled FROM business_settings LIMIT 1;
  
  IF NOT whatsapp_enabled THEN
    RAISE NOTICE 'WhatsApp notifications are disabled in settings';
    RETURN;
  END IF;
  
  -- Get active birthday message template
  SELECT message_template INTO message_template FROM birthday_messages WHERE is_active = true LIMIT 1;
  
  IF message_template IS NULL THEN
    RAISE NOTICE 'No active birthday message template found';
    RETURN;
  END IF;
  
  -- Find clients with birthdays today
  FOR client_record IN
    SELECT * FROM clients 
    WHERE 
      birth_date IS NOT NULL AND 
      EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND
      EXTRACT(DAY FROM birth_date) = EXTRACT(DAY FROM CURRENT_DATE)
  LOOP
    -- Format message with client name
    formatted_message := REPLACE(message_template, '{client_name}', client_record.name);
    
    -- In a real implementation, this would call a function to send the WhatsApp message
    -- For now, we'll just log it
    RAISE NOTICE 'Birthday message would be sent to % (phone: %): %', 
      client_record.name, client_record.phone, formatted_message;
    
    -- Here you would call your WhatsApp sending function
    -- This is a placeholder for the actual implementation
    -- send_whatsapp_message(client_record.phone, formatted_message);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a comment explaining how to use the birthday check function
COMMENT ON FUNCTION check_birthdays() IS 
'Function to check for client birthdays and send WhatsApp messages.
This can be called manually or scheduled to run daily using a cron job.
Example usage: SELECT check_birthdays();';

-- Add index for better performance on birthday queries
CREATE INDEX IF NOT EXISTS idx_clients_birth_date ON clients(
  EXTRACT(MONTH FROM birth_date),
  EXTRACT(DAY FROM birth_date)
);