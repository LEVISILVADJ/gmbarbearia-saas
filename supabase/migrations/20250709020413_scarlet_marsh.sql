/*
  # Add Tenant Support to Business Settings Table

  1. Updates
    - Add tenant_id column to business_settings table
    - Update policies to support multi-tenant architecture
    - Add foreign key constraint to tenants table

  2. Security
    - Update RLS policies to respect tenant boundaries
    - Allow tenant admins to manage their own business settings
*/

-- Add tenant_id column to business_settings if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN tenant_id uuid;
  END IF;
END $$;

-- Drop existing policies on business_settings
DROP POLICY IF EXISTS "Admin can manage business settings" ON business_settings;
DROP POLICY IF EXISTS "Anonymous can read business settings" ON business_settings;

-- Create new policies for business_settings
CREATE POLICY "Anonymous can read business settings"
  ON business_settings
  FOR SELECT
  TO anon
  USING (true);

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'business_settings' AND policyname = 'Tenant admins can manage their business settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Tenant admins can manage their business settings"
      ON business_settings
      FOR ALL
      TO authenticated
      USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))';
  END IF;
END $$;

-- Update business_settings to link to default tenant
UPDATE business_settings 
SET tenant_id = (SELECT id FROM tenants LIMIT 1)
WHERE tenant_id IS NULL;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'business_settings_tenant_id_fkey'
  ) THEN
    -- First check if the constraint exists with a different name
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.constraint_column_usage
      WHERE table_name = 'business_settings' AND column_name = 'tenant_id'
    ) THEN
      -- Only add the constraint if the tenants table exists and has data
      IF EXISTS (SELECT 1 FROM tenants LIMIT 1) THEN
        ALTER TABLE business_settings
          ADD CONSTRAINT business_settings_tenant_id_fkey
          FOREIGN KEY (tenant_id)
          REFERENCES tenants(id)
          ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;