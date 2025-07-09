/*
  # Criação das tabelas de assinaturas e pagamentos

  1. Novas Tabelas
    - `subscriptions`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key)
      - `provider` (text)
      - `provider_subscription_id` (text, nullable)
      - `status` (text)
      - `plan` (text)
      - `amount` (numeric)
      - `currency` (text, default 'BRL')
      - `billing_cycle` (text, default 'monthly')
      - `trial_ends_at` (timestamp with time zone, nullable)
      - `next_billing_at` (timestamp with time zone, nullable)
      - `canceled_at` (timestamp with time zone, nullable)
      - `payment_method` (text, nullable)
      - `metadata` (jsonb, nullable)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
    
    - `payments`
      - `id` (bigint, primary key)
      - `tenant_id` (uuid, foreign key)
      - `subscription_id` (uuid, foreign key, nullable)
      - `provider` (text)
      - `provider_payment_id` (text)
      - `amount` (numeric)
      - `currency` (text, default 'BRL')
      - `status` (text)
      - `payment_method` (text)
      - `payment_date` (timestamp with time zone)
      - `metadata` (jsonb, nullable)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for admin access and tenant owner access
*/

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  provider text NOT NULL,
  provider_subscription_id text,
  status text NOT NULL,
  plan text NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'BRL',
  billing_cycle text DEFAULT 'monthly',
  trial_ends_at timestamptz,
  next_billing_at timestamptz,
  canceled_at timestamptz,
  payment_method text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT subscriptions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Habilitar RLS para assinaturas
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL,
  subscription_id uuid,
  provider text NOT NULL,
  provider_payment_id text NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'BRL',
  status text NOT NULL,
  payment_method text NOT NULL,
  payment_date timestamptz NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT payments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

-- Habilitar RLS para pagamentos
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Adicionar trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança para assinaturas
CREATE POLICY "Green Sistemas admins can manage all subscriptions"
ON subscriptions
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM users
  WHERE (users.id = auth.uid() AND users.is_admin = true)
));

CREATE POLICY "Tenant owners can view their own subscriptions"
ON subscriptions
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM tenant_users
  WHERE (tenant_users.tenant_id = subscriptions.tenant_id AND tenant_users.user_id = auth.uid() AND tenant_users.role = 'owner')
));

-- Políticas de segurança para pagamentos
CREATE POLICY "Green Sistemas admins can manage all payments"
ON payments
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM users
  WHERE (users.id = auth.uid() AND users.is_admin = true)
));

CREATE POLICY "Tenant owners can view their own payments"
ON payments
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM tenant_users
  WHERE (tenant_users.tenant_id = payments.tenant_id AND tenant_users.user_id = auth.uid() AND tenant_users.role = 'owner')
));