/*
  # Add Tenant Support to Message Tables

  1. Updates
    - Add tenant_id column to birthday_messages and retention_messages tables
    - Update policies to support multi-tenant architecture
    - Add foreign key constraints to tenants table

  2. Security
    - Update RLS policies to respect tenant boundaries
    - Allow tenant admins to manage their own message templates
*/

-- Add tenant_id column to birthday_messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'birthday_messages' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE birthday_messages ADD COLUMN tenant_id uuid;
  END IF;
END $$;

-- Add tenant_id column to retention_messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'retention_messages' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE retention_messages ADD COLUMN tenant_id uuid;
  END IF;
END $$;

-- Drop existing policies on birthday_messages
DROP POLICY IF EXISTS "Admin can manage birthday messages" ON birthday_messages;
DROP POLICY IF EXISTS "Authenticated can read birthday messages" ON birthday_messages;

-- Create new policies for birthday_messages
CREATE POLICY "Authenticated can read birthday messages"
  ON birthday_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'birthday_messages' AND policyname = 'Tenant admins can manage their birthday messages'
  ) THEN
    EXECUTE 'CREATE POLICY "Tenant admins can manage their birthday messages"
      ON birthday_messages
      FOR ALL
      TO authenticated
      USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))';
  END IF;
END $$;

-- Drop existing policies on retention_messages
DROP POLICY IF EXISTS "Admin can manage retention messages" ON retention_messages;
DROP POLICY IF EXISTS "Authenticated can read retention messages" ON retention_messages;

-- Create new policies for retention_messages
CREATE POLICY "Authenticated can read retention messages"
  ON retention_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'retention_messages' AND policyname = 'Tenant admins can manage their retention messages'
  ) THEN
    EXECUTE 'CREATE POLICY "Tenant admins can manage their retention messages"
      ON retention_messages
      FOR ALL
      TO authenticated
      USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))';
  END IF;
END $$;

-- Update birthday_messages to link to default tenant
UPDATE birthday_messages 
SET tenant_id = (SELECT id FROM tenants LIMIT 1)
WHERE tenant_id IS NULL;

-- Update retention_messages to link to default tenant
UPDATE retention_messages 
SET tenant_id = (SELECT id FROM tenants LIMIT 1)
WHERE tenant_id IS NULL;

-- Add foreign key constraint to birthday_messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'birthday_messages_tenant_id_fkey'
  ) THEN
    -- First check if the constraint exists with a different name
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.constraint_column_usage
      WHERE table_name = 'birthday_messages' AND column_name = 'tenant_id'
    ) THEN
      -- Only add the constraint if the tenants table exists and has data
      IF EXISTS (SELECT 1 FROM tenants LIMIT 1) THEN
        ALTER TABLE birthday_messages
          ADD CONSTRAINT birthday_messages_tenant_id_fkey
          FOREIGN KEY (tenant_id)
          REFERENCES tenants(id)
          ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Add foreign key constraint to retention_messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'retention_messages_tenant_id_fkey'
  ) THEN
    -- First check if the constraint exists with a different name
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.constraint_column_usage
      WHERE table_name = 'retention_messages' AND column_name = 'tenant_id'
    ) THEN
      -- Only add the constraint if the tenants table exists and has data
      IF EXISTS (SELECT 1 FROM tenants LIMIT 1) THEN
        ALTER TABLE retention_messages
          ADD CONSTRAINT retention_messages_tenant_id_fkey
          FOREIGN KEY (tenant_id)
          REFERENCES tenants(id)
          ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;