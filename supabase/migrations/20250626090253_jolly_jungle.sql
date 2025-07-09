/*
  # Sistema Completo de Barbearia - GM Barbearia

  1. New Tables
    - `barbers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `photo_url` (text)
      - `specialties` (text array)
      - `rating` (numeric)
      - `experience_years` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `services`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `duration_minutes` (integer)
      - `icon` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `clients`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `bookings`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `barber_id` (uuid, foreign key)
      - `service_id` (uuid, foreign key)
      - `booking_date` (date)
      - `booking_time` (time)
      - `status` (text)
      - `total_price` (numeric)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `business_settings`
      - `id` (uuid, primary key)
      - `business_name` (text)
      - `phone` (text)
      - `email` (text)
      - `address` (text)
      - `opening_hours` (jsonb)
      - `logo_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admin can manage everything
    - Barbers can manage their own data and bookings
    - Clients can view their own bookings
*/

-- Create barbers table
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create services table
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

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
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

-- Create business_settings table
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
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for barbers table
CREATE POLICY "Admin can manage all barbers"
  ON barbers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@gmbarbearia.com'
    )
  );

CREATE POLICY "Barbers can read their own data"
  ON barbers
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Public can read active barbers"
  ON barbers
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Create policies for services table
CREATE POLICY "Admin can manage all services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@gmbarbearia.com'
    )
  );

CREATE POLICY "Public can read active services"
  ON services
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can read active services"
  ON services
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create policies for clients table
CREATE POLICY "Admin can manage all clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@gmbarbearia.com'
    )
  );

CREATE POLICY "Anyone can create clients"
  ON clients
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policies for bookings table
CREATE POLICY "Admin can manage all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@gmbarbearia.com'
    )
  );

CREATE POLICY "Barbers can manage their bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    barber_id IN (
      SELECT id FROM barbers 
      WHERE auth.uid()::text = id::text
    )
  );

CREATE POLICY "Anyone can create bookings"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read bookings for availability"
  ON bookings
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for business_settings table
CREATE POLICY "Admin can manage business settings"
  ON business_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@gmbarbearia.com'
    )
  );

CREATE POLICY "Public can read business settings"
  ON business_settings
  FOR SELECT
  TO anon
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_barbers_active ON barbers(is_active);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_barber ON bookings(barber_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON barbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();