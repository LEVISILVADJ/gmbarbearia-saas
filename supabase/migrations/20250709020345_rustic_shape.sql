/*
  # Add Tenant Support to Services Table

  1. Updates
    - Add tenant_id column to services table
    - Update policies to support multi-tenant architecture
    - Create indexes for better performance
    - Add foreign key constraint to tenants table

  2. Security
    - Update RLS policies to respect tenant boundaries
    - Allow tenant admins to manage their own services
*/

-- Add tenant_id column to services if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE services ADD COLUMN tenant_id uuid;
  END IF;
END $$;

-- Drop existing policies on services
DROP POLICY IF EXISTS "Admin can manage all services" ON services;
DROP POLICY IF EXISTS "Anonymous can read active services" ON services;
DROP POLICY IF EXISTS "Authenticated can read active services" ON services;

-- Create new policies for services
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

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' AND policyname = 'Tenant admins can manage their services'
  ) THEN
    EXECUTE 'CREATE POLICY "Tenant admins can manage their services"
      ON services
      FOR ALL
      TO authenticated
      USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))';
  END IF;
END $$;

-- Create or update indexes
DROP INDEX IF EXISTS idx_services_active;
DROP INDEX IF EXISTS idx_services_tenant;

CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_tenant ON services(tenant_id);

-- Update services to link to default tenant
UPDATE services 
SET tenant_id = (SELECT id FROM tenants LIMIT 1)
WHERE tenant_id IS NULL;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'services_tenant_id_fkey'
  ) THEN
    -- First check if the constraint exists with a different name
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.constraint_column_usage
      WHERE table_name = 'services' AND column_name = 'tenant_id'
    ) THEN
      -- Only add the constraint if the tenants table exists and has data
      IF EXISTS (SELECT 1 FROM tenants LIMIT 1) THEN
        ALTER TABLE services
          ADD CONSTRAINT services_tenant_id_fkey
          FOREIGN KEY (tenant_id)
          REFERENCES tenants(id)
          ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;