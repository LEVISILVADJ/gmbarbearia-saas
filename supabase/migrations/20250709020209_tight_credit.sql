-- Add tenant_id column to barbers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'barbers' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE barbers ADD COLUMN tenant_id uuid;
  END IF;
END $$;

-- Create function to get current tenant ID
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid AS $$
BEGIN
  -- For now, return null (single tenant mode)
  -- In multi-tenant mode, this would return the current tenant ID
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is tenant admin
CREATE OR REPLACE FUNCTION is_tenant_admin(tenant_id uuid)
RETURNS boolean AS $$
BEGIN
  -- For now, return false (only system admin has full access)
  -- In multi-tenant mode, this would check if the user is an admin for the given tenant
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies on barbers
DROP POLICY IF EXISTS "Admin can manage all barbers" ON barbers;
DROP POLICY IF EXISTS "Barbers can read their own data" ON barbers;
DROP POLICY IF EXISTS "Anonymous can read active barbers" ON barbers;

-- Create new, simpler policies for barbers
CREATE POLICY "Anonymous can read active barbers"
  ON barbers
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Barbers can read their own data"
  ON barbers
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'barbers' AND policyname = 'Tenant admins can manage their barbers'
  ) THEN
    EXECUTE 'CREATE POLICY "Tenant admins can manage their barbers"
      ON barbers
      FOR ALL
      TO authenticated
      USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))';
  END IF;
END $$;

-- Create or update indexes
DROP INDEX IF EXISTS idx_barbers_active;
DROP INDEX IF EXISTS idx_barbers_email;
DROP INDEX IF EXISTS idx_barbers_tenant;

CREATE INDEX idx_barbers_active ON barbers(is_active);
CREATE INDEX idx_barbers_email ON barbers(email);
CREATE INDEX idx_barbers_tenant ON barbers(tenant_id);

-- Create tenants table if it doesn't exist
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subdomain text NOT NULL UNIQUE,
  logo_url text,
  primary_color text DEFAULT '#f59e0b',
  secondary_color text DEFAULT '#ea580c',
  owner_email text NOT NULL,
  owner_name text NOT NULL,
  phone text,
  is_active boolean DEFAULT true,
  trial_ends_at timestamptz NOT NULL,
  subscription_status text DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'expired')),
  subscription_plan text DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  subscription_price numeric(10,2) DEFAULT 99.90,
  payment_method text,
  last_payment_at timestamptz,
  next_payment_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE tenants IS 'Tabela principal do sistema SaaS que armazena informações sobre cada barbearia cliente.
Cada tenant (inquilino) representa uma barbearia diferente no sistema.
O campo subdomain é usado para acessar a barbearia específica (ex: cliente.gmbarbearia.com).
O período de teste é controlado pelo campo trial_ends_at.';

-- Enable RLS on tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Check if policies exist before creating them
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenants' AND policyname = 'Green Sistemas admins can manage all tenants'
  ) THEN
    EXECUTE 'CREATE POLICY "Green Sistemas admins can manage all tenants"
      ON tenants
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.email = ''admin@greensistemas.com''
        )
      )';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenants' AND policyname = 'Tenant owners can view their own tenant'
  ) THEN
    EXECUTE 'CREATE POLICY "Tenant owners can view their own tenant"
      ON tenants
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM tenant_users
          WHERE tenant_users.tenant_id = tenants.id
          AND tenant_users.user_id = auth.uid()
          AND tenant_users.role = ''owner''
        )
      )';
  END IF;
END $$;

-- Create tenant_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS tenant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'barber')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Enable RLS on tenant_users
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- Check if policies exist before creating them
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenant_users' AND policyname = 'Green Sistemas admins can manage all tenant users'
  ) THEN
    EXECUTE 'CREATE POLICY "Green Sistemas admins can manage all tenant users"
      ON tenant_users
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.email = ''admin@greensistemas.com''
        )
      )';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenant_users' AND policyname = 'Tenant admins can manage their tenant users'
  ) THEN
    EXECUTE 'CREATE POLICY "Tenant admins can manage their tenant users"
      ON tenant_users
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM tenant_users tu
          WHERE tu.tenant_id = tenant_users.tenant_id
          AND tu.user_id = auth.uid()
          AND tu.role IN (''owner'', ''admin'')
        )
      )';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenant_users' AND policyname = 'Users can view their own tenant associations'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own tenant associations"
      ON tenant_users
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid())';
  END IF;
END $$;

-- Create indexes for tenants and tenant_users
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_users(user_id);

-- Create triggers for updated_at if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_tenants_updated_at'
  ) THEN
    CREATE TRIGGER update_tenants_updated_at 
      BEFORE UPDATE ON tenants 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_tenant_users_updated_at'
  ) THEN
    CREATE TRIGGER update_tenant_users_updated_at 
      BEFORE UPDATE ON tenant_users 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default tenant if none exists
INSERT INTO tenants (
  name, 
  subdomain, 
  owner_email, 
  owner_name, 
  trial_ends_at
)
SELECT 
  'GM Barbearia', 
  'gmbarbearia', 
  'admin@gmbarbearia.com', 
  'Administrador', 
  (CURRENT_DATE + INTERVAL '30 days')
WHERE NOT EXISTS (
  SELECT 1 FROM tenants LIMIT 1
);

-- Update barbers to link to default tenant
UPDATE barbers 
SET tenant_id = (SELECT id FROM tenants LIMIT 1)
WHERE tenant_id IS NULL;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'barbers_tenant_id_fkey'
  ) THEN
    -- First check if the constraint exists with a different name
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.constraint_column_usage
      WHERE table_name = 'barbers' AND column_name = 'tenant_id'
    ) THEN
      -- Only add the constraint if the tenants table exists and has data
      IF EXISTS (SELECT 1 FROM tenants LIMIT 1) THEN
        ALTER TABLE barbers
          ADD CONSTRAINT barbers_tenant_id_fkey
          FOREIGN KEY (tenant_id)
          REFERENCES tenants(id)
          ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Create users table if it doesn't exist (for reference only)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Check if policies exist before creating them
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can view their own data'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own data"
      ON users
      FOR SELECT
      TO authenticated
      USING (id = auth.uid())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Green Sistemas admins can manage all users'
  ) THEN
    EXECUTE 'CREATE POLICY "Green Sistemas admins can manage all users"
      ON users
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.is_admin = true
        )
      )';
  END IF;
END $$;

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;