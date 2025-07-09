/*
  # Criação da tabela de usuários de tenant

  1. Nova Tabela
    - `tenant_users`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `role` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  
  2. Security
    - Enable RLS on `tenant_users` table
    - Add policies for admin access and tenant admin access
*/

CREATE TABLE IF NOT EXISTS tenant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT tenant_users_tenant_id_user_id_key UNIQUE (tenant_id, user_id),
  CONSTRAINT tenant_users_role_check CHECK (role = ANY (ARRAY['owner', 'admin', 'barber'])),
  CONSTRAINT tenant_users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT tenant_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_tenant_users_updated_at
BEFORE UPDATE ON tenant_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para melhorar performance
CREATE INDEX idx_tenant_users_tenant ON tenant_users USING btree (tenant_id);
CREATE INDEX idx_tenant_users_user ON tenant_users USING btree (user_id);

-- Políticas de segurança
CREATE POLICY "Green Sistemas admins can manage all tenant users"
ON tenant_users
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM auth.users
  WHERE (users.id = auth.uid() AND (users.email)::text = 'admin@greensistemas.com'::text)
));

CREATE POLICY "Tenant admins can manage their tenant users"
ON tenant_users
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM tenant_users tu
  WHERE (tu.tenant_id = tenant_users.tenant_id AND tu.user_id = auth.uid() AND tu.role = ANY (ARRAY['owner', 'admin']))
));

CREATE POLICY "Users can view their own tenant associations"
ON tenant_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());