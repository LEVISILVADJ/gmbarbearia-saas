/*
  # Inserir Dados Iniciais - GM Barbearia

  1. Dados Iniciais
    - Barbeiros padrão
    - Serviços padrão
    - Configurações do negócio
*/

-- Insert initial barbers
INSERT INTO barbers (name, email, phone, photo_url, specialties, rating, experience_years, is_active) VALUES
('Carlos Silva', 'carlos@gmbarbearia.com', '(11) 99999-0001', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300', ARRAY['Corte Clássico', 'Barba', 'Degradê'], 4.9, 8, true),
('João Santos', 'joao@gmbarbearia.com', '(11) 99999-0002', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300', ARRAY['Corte Moderno', 'Sobrancelha', 'Barba'], 4.8, 6, true),
('Pedro Costa', 'pedro@gmbarbearia.com', '(11) 99999-0003', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300', ARRAY['Corte Social', 'Degradê', 'Barba Completa'], 4.7, 5, true),
('Rafael Lima', 'rafael@gmbarbearia.com', '(11) 99999-0004', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300', ARRAY['Corte Infantil', 'Corte Clássico', 'Sobrancelha'], 4.9, 7, true)
ON CONFLICT (email) DO NOTHING;

-- Insert initial services
INSERT INTO services (name, description, price, duration_minutes, icon, is_active) VALUES
('Corte Tradicional', 'Corte clássico com acabamento perfeito', 25.00, 30, '✂️', true),
('Corte + Barba', 'Corte completo com barba alinhada', 40.00, 45, '🧔', true),
('Barba Completa', 'Barba feita com navalha e acabamento', 20.00, 25, '🪒', true),
('Sobrancelha', 'Alinhamento e design de sobrancelhas', 10.00, 15, '👁️', true),
('Corte Infantil', 'Corte especial para crianças', 20.00, 25, '👶', true),
('Degradê', 'Corte degradê moderno', 30.00, 35, '💇', true)
ON CONFLICT DO NOTHING;

-- Insert initial business settings
INSERT INTO business_settings (business_name, phone, email, address, opening_hours, logo_url) VALUES
('GM Barbearia', '(11) 99999-9999', 'contato@gmbarbearia.com', 'Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567', 
'{
  "monday": {"open": "08:00", "close": "18:00", "closed": false},
  "tuesday": {"open": "08:00", "close": "18:00", "closed": false},
  "wednesday": {"open": "08:00", "close": "18:00", "closed": false},
  "thursday": {"open": "08:00", "close": "18:00", "closed": false},
  "friday": {"open": "08:00", "close": "18:00", "closed": false},
  "saturday": {"open": "08:00", "close": "16:00", "closed": false},
  "sunday": {"open": "08:00", "close": "16:00", "closed": true}
}', '/b34c68b1-5cec-4225-9b7a-caee7bba0335.png')
ON CONFLICT DO NOTHING;