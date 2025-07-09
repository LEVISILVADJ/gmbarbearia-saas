-- =====================================================
-- GM BARBEARIA - SCRIPT COMPLETO DE CONFIGURAÇÃO
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar função para verificar se é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() ->> 'email') = 'admin@gmbarbearia.com',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para obter ID do usuário atual
CREATE OR REPLACE FUNCTION uid()
RETURNS uuid AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de barbeiros
CREATE TABLE IF NOT EXISTS barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  photo_url text,
  specialties text[] DEFAULT '{}',
  rating numeric(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  experience_years integer DEFAULT 0,
  is_active boolean DEFAULT true,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  icon text DEFAULT '✂️',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  barber_id uuid REFERENCES barbers(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  status text DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado')),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de configurações do negócio
CREATE TABLE IF NOT EXISTS business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text DEFAULT 'GM Barbearia',
  phone text DEFAULT '(11) 99999-9999',
  email text DEFAULT 'contato@gmbarbearia.com',
  address text DEFAULT 'Rua das Flores, 123 - Centro, São Paulo - SP',
  opening_hours jsonb DEFAULT '{
    "monday": {"open": "08:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "08:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "08:00", "close": "18:00", "closed": false},
    "thursday": {"open": "08:00", "close": "18:00", "closed": false},
    "friday": {"open": "08:00", "close": "18:00", "closed": false},
    "saturday": {"open": "08:00", "close": "16:00", "closed": false},
    "sunday": {"open": "08:00", "close": "16:00", "closed": true}
  }',
  logo_url text DEFAULT '/WhatsApp Image 2025-06-26 at 08.22.png',
  whatsapp_api_key text,
  whatsapp_phone_number text,
  whatsapp_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de imagens do slideshow
CREATE TABLE IF NOT EXISTS slideshow_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de imagens da galeria
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  description text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_barbers_active ON barbers(is_active);
CREATE INDEX IF NOT EXISTS idx_barbers_email ON barbers(email);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_barber ON bookings(barber_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_slideshow_images_active ON slideshow_images(is_active);
CREATE INDEX IF NOT EXISTS idx_slideshow_images_order ON slideshow_images(order_index);
CREATE INDEX IF NOT EXISTS idx_gallery_images_active ON gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON gallery_images(order_index);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

DROP TRIGGER IF EXISTS update_barbers_updated_at ON barbers;
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON barbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_settings_updated_at ON business_settings;
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_slideshow_images_updated_at ON slideshow_images;
CREATE TRIGGER update_slideshow_images_updated_at BEFORE UPDATE ON slideshow_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_images_updated_at ON gallery_images;
CREATE TRIGGER update_gallery_images_updated_at BEFORE UPDATE ON gallery_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE slideshow_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS - BARBEIROS
-- =====================================================

DROP POLICY IF EXISTS "Admin can manage all barbers" ON barbers;
CREATE POLICY "Admin can manage all barbers"
  ON barbers FOR ALL TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Barbers can read their own data" ON barbers;
CREATE POLICY "Barbers can read their own data"
  ON barbers FOR SELECT TO authenticated
  USING (uid() = user_id);

DROP POLICY IF EXISTS "Anonymous can read active barbers" ON barbers;
CREATE POLICY "Anonymous can read active barbers"
  ON barbers FOR SELECT TO anon
  USING (is_active = true);

-- =====================================================
-- POLÍTICAS RLS - SERVIÇOS
-- =====================================================

DROP POLICY IF EXISTS "Admin can manage all services" ON services;
CREATE POLICY "Admin can manage all services"
  ON services FOR ALL TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Anonymous can read active services" ON services;
CREATE POLICY "Anonymous can read active services"
  ON services FOR SELECT TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated can read active services" ON services;
CREATE POLICY "Authenticated can read active services"
  ON services FOR SELECT TO authenticated
  USING (is_active = true);

-- =====================================================
-- POLÍTICAS RLS - CLIENTES
-- =====================================================

DROP POLICY IF EXISTS "Admin can manage all clients" ON clients;
CREATE POLICY "Admin can manage all clients"
  ON clients FOR ALL TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Anyone can create and read clients" ON clients;
CREATE POLICY "Anyone can create and read clients"
  ON clients FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- =====================================================
-- POLÍTICAS RLS - AGENDAMENTOS
-- =====================================================

DROP POLICY IF EXISTS "Admin can manage all bookings" ON bookings;
CREATE POLICY "Admin can manage all bookings"
  ON bookings FOR ALL TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Barbers can manage their bookings" ON bookings;
CREATE POLICY "Barbers can manage their bookings"
  ON bookings FOR ALL TO authenticated
  USING (
    barber_id IN (
      SELECT id FROM barbers 
      WHERE uid() = user_id
    )
  );

DROP POLICY IF EXISTS "Anyone can create and read bookings" ON bookings;
CREATE POLICY "Anyone can create and read bookings"
  ON bookings FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- =====================================================
-- POLÍTICAS RLS - CONFIGURAÇÕES
-- =====================================================

DROP POLICY IF EXISTS "Admin can manage business settings" ON business_settings;
CREATE POLICY "Admin can manage business settings"
  ON business_settings FOR ALL TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Anonymous can read business settings" ON business_settings;
CREATE POLICY "Anonymous can read business settings"
  ON business_settings FOR SELECT TO anon
  USING (true);

-- =====================================================
-- POLÍTICAS RLS - SLIDESHOW
-- =====================================================

DROP POLICY IF EXISTS "Admin can manage all slideshow images" ON slideshow_images;
CREATE POLICY "Admin can manage all slideshow images"
  ON slideshow_images FOR ALL TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Anonymous can read active slideshow images" ON slideshow_images;
CREATE POLICY "Anonymous can read active slideshow images"
  ON slideshow_images FOR SELECT TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated can read active slideshow images" ON slideshow_images;
CREATE POLICY "Authenticated can read active slideshow images"
  ON slideshow_images FOR SELECT TO authenticated
  USING (is_active = true);

-- =====================================================
-- POLÍTICAS RLS - GALERIA
-- =====================================================

DROP POLICY IF EXISTS "Admin can manage all gallery images" ON gallery_images;
CREATE POLICY "Admin can manage all gallery images"
  ON gallery_images FOR ALL TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Anonymous can read active gallery images" ON gallery_images;
CREATE POLICY "Anonymous can read active gallery images"
  ON gallery_images FOR SELECT TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated can read active gallery images" ON gallery_images;
CREATE POLICY "Authenticated can read active gallery images"
  ON gallery_images FOR SELECT TO authenticated
  USING (is_active = true);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir barbeiros iniciais
INSERT INTO barbers (name, email, phone, photo_url, specialties, rating, experience_years, is_active) VALUES
('Carlos Silva', 'carlos@gmbarbearia.com', '(11) 99999-0001', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300', ARRAY['Corte Clássico', 'Barba', 'Degradê'], 4.9, 8, true),
('João Santos', 'joao@gmbarbearia.com', '(11) 99999-0002', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300', ARRAY['Corte Moderno', 'Sobrancelha', 'Barba'], 4.8, 6, true),
('Pedro Costa', 'pedro@gmbarbearia.com', '(11) 99999-0003', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300', ARRAY['Corte Social', 'Degradê', 'Barba Completa'], 4.7, 5, true),
('Rafael Lima', 'rafael@gmbarbearia.com', '(11) 99999-0004', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300', ARRAY['Corte Infantil', 'Corte Clássico', 'Sobrancelha'], 4.9, 7, true)
ON CONFLICT (email) DO NOTHING;

-- Inserir serviços iniciais
INSERT INTO services (name, description, price, duration_minutes, icon, is_active) VALUES
('Corte Tradicional', 'Corte clássico com acabamento perfeito', 25.00, 30, '✂️', true),
('Corte + Barba', 'Corte completo com barba alinhada', 40.00, 45, '🧔', true),
('Barba Completa', 'Barba feita com navalha e acabamento', 20.00, 25, '🪒', true),
('Sobrancelha', 'Alinhamento e design de sobrancelhas', 10.00, 15, '👁️', true),
('Corte Infantil', 'Corte especial para crianças', 20.00, 25, '👶', true),
('Degradê', 'Corte degradê moderno', 30.00, 35, '💇', true)
ON CONFLICT DO NOTHING;

-- Inserir configurações do negócio
INSERT INTO business_settings (business_name, phone, email, address, opening_hours, logo_url, whatsapp_enabled) VALUES
('GM Barbearia', '(11) 99999-9999', 'contato@gmbarbearia.com', 'Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567', 
'{
  "monday": {"open": "08:00", "close": "18:00", "closed": false},
  "tuesday": {"open": "08:00", "close": "18:00", "closed": false},
  "wednesday": {"open": "08:00", "close": "18:00", "closed": false},
  "thursday": {"open": "08:00", "close": "18:00", "closed": false},
  "friday": {"open": "08:00", "close": "18:00", "closed": false},
  "saturday": {"open": "08:00", "close": "16:00", "closed": false},
  "sunday": {"open": "08:00", "close": "16:00", "closed": true}
}', '/WhatsApp Image 2025-06-26 at 08.22.png', false)
ON CONFLICT DO NOTHING;

-- Inserir imagens do slideshow
INSERT INTO slideshow_images (title, image_url, alt_text, order_index, is_active) VALUES
('Interior da Barbearia 1', '/03d0d17b-50d9-4901-8828-3920ab89437f.jpg', 'Vista geral do interior da barbearia com cadeiras e espelhos', 1, true),
('Interior da Barbearia 2', '/85d9542f-928a-4f42-a117-f19c5423163c.jpg', 'Ambiente moderno da barbearia com iluminação profissional', 2, true),
('Estações de Trabalho', '/77542818-87ad-4321-9523-ac3fe48f4209.jpg', 'Estações de trabalho dos barbeiros com espelhos e equipamentos', 3, true),
('Área de Atendimento', '/5b5ec10a-7930-4bf9-830d-b83c0292129b.jpg', 'Área principal de atendimento aos clientes', 4, true),
('Ambiente Completo', '/447f176b-41ee-497f-9d13-011dd5475284.jpg', 'Vista completa do ambiente da barbearia', 5, true)
ON CONFLICT DO NOTHING;

-- Inserir imagens da galeria
INSERT INTO gallery_images (title, image_url, alt_text, description, order_index, is_active) VALUES
('Degradê Moderno', '/378cb9c6-0863-42aa-ad7f-b2a338f13f2e.jpg', 'Corte degradê moderno com acabamento perfeito', 'Corte degradê moderno com acabamento perfeito e transições suaves', 1, true),
('Corte Clássico com Risco', '/d7f6cecd-0b2b-4a33-a217-abcaa4f68a12.jpg', 'Corte clássico com risco lateral e acabamento profissional', 'Corte clássico com risco lateral bem definido e acabamento profissional', 2, true),
('Corte Social Premium', '/a8278cba-7226-4554-baa9-4f6b7d287121.jpg', 'Corte social com degradê e risco bem definido', 'Corte social elegante com degradê e risco bem definido para ocasiões especiais', 3, true),
('Buzz Cut Moderno', '/965c0cf0-4972-4730-8d2b-c6ae3c3bc785.jpg', 'Corte buzz cut moderno com acabamento preciso', 'Corte buzz cut moderno com acabamento preciso e uniforme', 4, true),
('Pompadour Clássico', '/61580cfb-8ad0-44ae-925f-f9db36fde0e0.jpg', 'Corte pompadour com barba alinhada', 'Corte pompadour clássico com barba perfeitamente alinhada e acabamento premium', 5, true),
('Corte Moderno com Barba', '/2efda2f9-f8f1-411a-b6e6-a81d3f7d39f4-copy.jpg', 'Corte moderno com barba bem alinhada e acabamento profissional', 'Corte moderno com barba perfeitamente alinhada e acabamento profissional de alta qualidade', 6, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FINALIZAÇÃO
-- =====================================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '🎉 GM BARBEARIA - CONFIGURAÇÃO CONCLUÍDA COM SUCESSO! 🎉';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Todas as tabelas foram criadas';
  RAISE NOTICE '✅ Políticas RLS configuradas';
  RAISE NOTICE '✅ Dados iniciais inseridos';
  RAISE NOTICE '✅ Índices criados para performance';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 CREDENCIAIS PADRÃO:';
  RAISE NOTICE '   Admin: admin@gmbarbearia.com / admin123';
  RAISE NOTICE '   Barbeiros: carlos@gmbarbearia.com / barber123';
  RAISE NOTICE '';
  RAISE NOTICE '📱 Próximo passo: Configure as variáveis de ambiente no Netlify';
  RAISE NOTICE '   VITE_SUPABASE_URL=https://atenwzwmgzvtclqnafda.supabase.co';
  RAISE NOTICE '   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
END $$;