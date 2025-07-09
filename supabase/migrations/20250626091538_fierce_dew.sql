/*
  # Criar tabela de usuários para autenticação

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `name` (text)
      - `role` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for authentication
    - Admin can manage all users
    - Users can read their own data

  3. Initial Data
    - Admin user
    - Barber users
*/

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'barber')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Admin can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@gmbarbearia.com'
    )
  );

CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public can read users for authentication"
  ON users
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert admin user
INSERT INTO users (email, password_hash, name, role, is_active) VALUES
('admin@gmbarbearia.com', '$2b$10$rQZ9QmjqjKjKjKjKjKjKjOeH8H8H8H8H8H8H8H8H8H8H8H8H8H8H8', 'Administrador', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Insert barber users
INSERT INTO users (email, password_hash, name, role, is_active) VALUES
('carlos@gmbarbearia.com', '$2b$10$rQZ9QmjqjKjKjKjKjKjKjOeH8H8H8H8H8H8H8H8H8H8H8H8H8H8H8', 'Carlos Silva', 'barber', true),
('joao@gmbarbearia.com', '$2b$10$rQZ9QmjqjKjKjKjKjKjKjOeH8H8H8H8H8H8H8H8H8H8H8H8H8H8H8', 'João Santos', 'barber', true),
('pedro@gmbarbearia.com', '$2b$10$rQZ9QmjqjKjKjKjKjKjKjOeH8H8H8H8H8H8H8H8H8H8H8H8H8H8H8', 'Pedro Costa', 'barber', true),
('rafael@gmbarbearia.com', '$2b$10$rQZ9QmjqjKjKjKjKjKjKjOeH8H8H8H8H8H8H8H8H8H8H8H8H8H8H8', 'Rafael Lima', 'barber', true)
ON CONFLICT (email) DO NOTHING;

-- Update barbers table to link with users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'barbers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE barbers ADD COLUMN user_id uuid REFERENCES users(id);
  END IF;
END $$;

-- Link existing barbers with users
UPDATE barbers SET user_id = (
  SELECT id FROM users WHERE users.email = barbers.email
) WHERE user_id IS NULL;