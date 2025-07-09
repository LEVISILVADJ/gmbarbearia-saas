/*
  # Criação da tabela de usuários

  1. Nova Tabela
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `avatar_url` (text, nullable)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  
  2. Security
    - Enable RLS on `users` table
    - Add policies for admin access and user self-access
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Adicionar constraint de chave estrangeira para auth.users
ALTER TABLE users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança
CREATE POLICY "Green Sistemas admins can manage all users"
ON users
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM users users_1
  WHERE (users_1.id = auth.uid() AND users_1.is_admin = true)
));

CREATE POLICY "Users can view their own data"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());