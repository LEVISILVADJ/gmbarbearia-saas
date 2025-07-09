/*
  # Criação do esquema para tenants (barbearias)

  Este arquivo contém a estrutura de tabelas que será usada para cada tenant (barbearia).
  Quando um novo tenant é criado, estas tabelas são criadas em um novo banco de dados específico para o tenant.

  1. Novas Tabelas
    - `barbers` - Barbeiros da barbearia
    - `services` - Serviços oferecidos
    - `clients` - Clientes da barbearia
    - `bookings` - Agendamentos
    - `business_settings` - Configurações da barbearia
    - `slideshow_images` - Imagens do slideshow
    - `gallery_images` - Imagens da galeria
    - `birthday_messages` - Modelos de mensagens de aniversário
    - `retention_messages` - Modelos de mensagens de retenção
*/

-- Barbers table
CREATE TABLE IF NOT EXISTS barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  photo_url text,
  specialties text[] DEFAULT '{}'::text[],
  rating numeric(2,1) DEFAULT 0.0,
  experience_years integer DEFAULT 0,
  is_active boolean DEFAULT true,
  user_id uuid,
  tenant_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT barbers_rating_check CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT barbers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT barbers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_barbers_updated_at
BEFORE UPDATE ON barbers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para melhorar performance
CREATE INDEX idx_barbers_email ON barbers USING btree (email);
CREATE INDEX idx_barbers_active ON barbers USING btree (is_active);
CREATE INDEX idx_barbers_tenant ON barbers USING btree (tenant_id);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  duration_minutes integer NOT NULL,
  icon text DEFAULT '✂️',
  is_active boolean DEFAULT true,
  tenant_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT services_price_check CHECK (price >= 0),
  CONSTRAINT services_duration_minutes_check CHECK (duration_minutes > 0),
  CONSTRAINT services_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para melhorar performance
CREATE INDEX idx_services_active ON services USING btree (is_active);
CREATE INDEX idx_services_tenant ON services USING btree (tenant_id);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  birth_date date,
  last_visit_date date,
  tenant_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT clients_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para melhorar performance
CREATE INDEX idx_clients_phone ON clients USING btree (phone);
CREATE INDEX idx_clients_last_visit ON clients USING btree (last_visit_date);
CREATE INDEX idx_clients_birth_date ON clients USING btree (EXTRACT(month FROM birth_date), EXTRACT(day FROM birth_date));
CREATE INDEX idx_clients_tenant ON clients USING btree (tenant_id);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid,
  barber_id uuid,
  service_id uuid,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  status text DEFAULT 'agendado',
  total_price numeric(10,2) NOT NULL,
  notes text,
  tenant_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT bookings_status_check CHECK (status = ANY (ARRAY['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'])),
  CONSTRAINT bookings_total_price_check CHECK (total_price >= 0),
  CONSTRAINT bookings_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT bookings_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE,
  CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  CONSTRAINT bookings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Adicionar trigger para atualizar a data da última visita do cliente
CREATE TRIGGER update_client_last_visit_trigger
AFTER UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_client_last_visit();

-- Criar índices para melhorar performance
CREATE INDEX idx_bookings_date ON bookings USING btree (booking_date);
CREATE INDEX idx_bookings_barber ON bookings USING btree (barber_id);
CREATE INDEX idx_bookings_status ON bookings USING btree (status);
CREATE INDEX idx_bookings_tenant ON bookings USING btree (tenant_id);

-- Business settings table
CREATE TABLE IF NOT EXISTS business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text DEFAULT 'GM Barbearia',
  phone text DEFAULT '(11) 99999-9999',
  email text DEFAULT 'contato@gmbarbearia.com',
  address text DEFAULT 'Rua das Flores, 123 - Centro, São Paulo - SP',
  description text,
  footer_address text,
  opening_hours jsonb DEFAULT '{
    "monday": {"open": "08:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "08:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "08:00", "close": "18:00", "closed": false},
    "thursday": {"open": "08:00", "close": "18:00", "closed": false},
    "friday": {"open": "08:00", "close": "18:00", "closed": false},
    "saturday": {"open": "08:00", "close": "16:00", "closed": false},
    "sunday": {"open": "08:00", "close": "16:00", "closed": true}
  }',
  logo_url text,
  whatsapp_api_key text,
  whatsapp_phone_number text,
  whatsapp_enabled boolean DEFAULT false,
  primary_color text DEFAULT '#f59e0b',
  secondary_color text DEFAULT '#ea580c',
  theme_mode text DEFAULT 'dark',
  tenant_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT business_settings_theme_mode_check CHECK (theme_mode = ANY (ARRAY['dark', 'light'])),
  CONSTRAINT business_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_business_settings_updated_at
BEFORE UPDATE ON business_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Slideshow images table
CREATE TABLE IF NOT EXISTS slideshow_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  tenant_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT slideshow_images_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE slideshow_images ENABLE ROW LEVEL SECURITY;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_slideshow_images_updated_at
BEFORE UPDATE ON slideshow_images
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para melhorar performance
CREATE INDEX idx_slideshow_images_active ON slideshow_images USING btree (is_active);
CREATE INDEX idx_slideshow_images_order ON slideshow_images USING btree (order_index);
CREATE INDEX idx_slideshow_images_tenant ON slideshow_images USING btree (tenant_id);

-- Gallery images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  description text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  tenant_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT gallery_images_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_gallery_images_updated_at
BEFORE UPDATE ON gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para melhorar performance
CREATE INDEX idx_gallery_images_active ON gallery_images USING btree (is_active);
CREATE INDEX idx_gallery_images_order ON gallery_images USING btree (order_index);
CREATE INDEX idx_gallery_images_tenant ON gallery_images USING btree (tenant_id);

-- Birthday messages table
CREATE TABLE IF NOT EXISTS birthday_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message_template text NOT NULL,
  is_active boolean DEFAULT true,
  tenant_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT birthday_messages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE birthday_messages ENABLE ROW LEVEL SECURITY;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_birthday_messages_updated_at
BEFORE UPDATE ON birthday_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Retention messages table
CREATE TABLE IF NOT EXISTS retention_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message_template text NOT NULL,
  days_inactive integer DEFAULT 60 NOT NULL,
  is_active boolean DEFAULT true,
  tenant_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT retention_messages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE retention_messages ENABLE ROW LEVEL SECURITY;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_retention_messages_updated_at
BEFORE UPDATE ON retention_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança para todas as tabelas

-- Barbers
CREATE POLICY "Anonymous can read active barbers"
ON barbers
FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "Authenticated can read active barbers"
ON barbers
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Barbers can read their own data"
ON barbers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Tenant admins can manage their barbers"
ON barbers
FOR ALL
TO authenticated
USING (is_admin() OR is_tenant_admin(tenant_id) OR (tenant_id IS NULL) OR (tenant_id = current_tenant_id()))
WITH CHECK (is_admin() OR is_tenant_admin(tenant_id) OR (tenant_id IS NULL) OR (tenant_id = current_tenant_id()));

CREATE POLICY "Admins can create barbers"
ON barbers
FOR INSERT
TO authenticated
WITH CHECK (is_admin() OR (is_tenant_admin(tenant_id) OR (tenant_id IS NULL)));

-- Services
CREATE POLICY "Anonymous can read active services"
ON services
FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "Authenticated can read active services"
ON services
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Tenant admins can manage their services"
ON services
FOR ALL
TO authenticated
USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))
WITH CHECK ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)));

-- Clients
CREATE POLICY "Anyone can create and read clients"
ON clients
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Tenant admins can manage their clients"
ON clients
FOR ALL
TO authenticated
USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))
WITH CHECK ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)));

-- Bookings
CREATE POLICY "Anyone can create and read bookings"
ON bookings
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Barbers can manage their bookings"
ON bookings
FOR ALL
TO authenticated
USING (barber_id IN (
  SELECT barbers.id
  FROM barbers
  WHERE (auth.uid() = barbers.user_id)
))
WITH CHECK (barber_id IN (
  SELECT barbers.id
  FROM barbers
  WHERE (auth.uid() = barbers.user_id)
));

CREATE POLICY "Tenant admins can manage their bookings"
ON bookings
FOR ALL
TO authenticated
USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))
WITH CHECK ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)));

-- Business Settings
CREATE POLICY "Anyone can read business settings"
ON business_settings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage business settings"
ON business_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Slideshow Images
CREATE POLICY "Anonymous can read active slideshow images"
ON slideshow_images
FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "Authenticated can read active slideshow images"
ON slideshow_images
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Tenant admins can manage their slideshow images"
ON slideshow_images
FOR ALL
TO authenticated
USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))
WITH CHECK ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)));

-- Gallery Images
CREATE POLICY "Anonymous can read active gallery images"
ON gallery_images
FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "Authenticated can read active gallery images"
ON gallery_images
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Tenant admins can manage their gallery images"
ON gallery_images
FOR ALL
TO authenticated
USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))
WITH CHECK ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)));

-- Birthday Messages
CREATE POLICY "Authenticated can read birthday messages"
ON birthday_messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Tenant admins can manage their birthday messages"
ON birthday_messages
FOR ALL
TO authenticated
USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))
WITH CHECK ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)));

-- Retention Messages
CREATE POLICY "Authenticated can read retention messages"
ON retention_messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Tenant admins can manage their retention messages"
ON retention_messages
FOR ALL
TO authenticated
USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))
WITH CHECK ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)));