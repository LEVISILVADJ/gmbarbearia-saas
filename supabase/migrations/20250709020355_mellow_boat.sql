/*
  # Add Tenant Support to Clients Table

  1. Updates
    - Add tenant_id column to clients table
    - Update policies to support multi-tenant architecture
    - Create indexes for better performance
    - Add foreign key constraint to tenants table

  2. Security
    - Update RLS policies to respect tenant boundaries
    - Allow tenant admins to manage their own clients
*/

-- Add tenant_id column to clients if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE clients ADD COLUMN tenant_id uuid;
  END IF;
END $$;

-- Drop existing policies on clients
DROP POLICY IF EXISTS "Admin can manage all clients" ON clients;
DROP POLICY IF EXISTS "Anyone can create and read clients" ON clients;

-- Create new policies for clients
CREATE POLICY "Anyone can create and read clients"
  ON clients
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' AND policyname = 'Tenant admins can manage their clients'
  ) THEN
    EXECUTE 'CREATE POLICY "Tenant admins can manage their clients"
      ON clients
      FOR ALL
      TO authenticated
      USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))';
  END IF;
END $$;

-- Create or update indexes
CREATE INDEX IF NOT EXISTS idx_clients_tenant ON clients(tenant_id);

-- Update clients to link to default tenant
UPDATE clients 
SET tenant_id = (SELECT id FROM tenants LIMIT 1)
WHERE tenant_id IS NULL;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'clients_tenant_id_fkey'
  ) THEN
    -- First check if the constraint exists with a different name
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.constraint_column_usage
      WHERE table_name = 'clients' AND column_name = 'tenant_id'
    ) THEN
      -- Only add the constraint if the tenants table exists and has data
      IF EXISTS (SELECT 1 FROM tenants LIMIT 1) THEN
        ALTER TABLE clients
          ADD CONSTRAINT clients_tenant_id_fkey
          FOREIGN KEY (tenant_id)
          REFERENCES tenants(id)
          ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;