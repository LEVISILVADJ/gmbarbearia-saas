/*
  # Criação da tabela de tenants (barbearias)

  1. Nova Tabela
    - `tenants`
      - `id` (uuid, primary key)
      - `name` (text)
      - `subdomain` (text, unique)
      - `logo_url` (text, nullable)
      - `primary_color` (text, default '#f59e0b')
      - `secondary_color` (text, default '#ea580c')
      - `theme_mode` (text, default 'dark')
      - `owner_email` (text)
      - `owner_name` (text)
      - `phone` (text, nullable)
      - `is_active` (boolean, default true)
      - `trial_ends_at` (timestamp with time zone)
      - `subscription_status` (text, default 'trial')
      - `subscription_plan` (text, default 'basic')
      - `subscription_price` (numeric, default 99.90)
      - `payment_method` (text, nullable)
      - `last_payment_at` (timestamp with time zone, nullable)
      - `next_payment_at` (timestamp with time zone, nullable)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  
  2. Security
    - Enable RLS on `tenants` table
    - Add policies for admin access and tenant owner access
*/

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subdomain text NOT NULL UNIQUE,
  logo_url text,
  primary_color text DEFAULT '#f59e0b',
  secondary_color text DEFAULT '#ea580c',
  theme_mode text DEFAULT 'dark',
  owner_email text NOT NULL,
  owner_name text NOT NULL,
  phone text,
  is_active boolean DEFAULT true,
  trial_ends_at timestamptz NOT NULL,
  subscription_status text DEFAULT 'trial',
  subscription_plan text DEFAULT 'basic',
  subscription_price numeric(10,2) DEFAULT 99.90,
  payment_method text,
  last_payment_at timestamptz,
  next_payment_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT tenants_subscription_status_check CHECK (subscription_status = ANY (ARRAY['trial', 'active', 'past_due', 'canceled', 'expired'])),
  CONSTRAINT tenants_subscription_plan_check CHECK (subscription_plan = ANY (ARRAY['basic', 'premium', 'enterprise'])),
  CONSTRAINT tenants_theme_mode_check CHECK (theme_mode = ANY (ARRAY['dark', 'light']))
);

-- Habilitar RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para melhorar performance
CREATE INDEX idx_tenants_subdomain ON tenants USING btree (subdomain);
CREATE INDEX idx_tenants_status ON tenants USING btree (subscription_status);

-- Políticas de segurança
CREATE POLICY "Green Sistemas admins can manage all tenants"
ON tenants
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM auth.users
  WHERE (users.id = auth.uid() AND (users.email)::text = 'admin@greensistemas.com'::text)
));

CREATE POLICY "Tenant owners can view their own tenant"
ON tenants
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM tenant_users
  WHERE (tenant_users.tenant_id = tenants.id AND tenant_users.user_id = auth.uid() AND tenant_users.role = 'owner')
));