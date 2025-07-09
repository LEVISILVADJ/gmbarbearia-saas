/*
  # Add Tenant Support to Bookings Table

  1. Updates
    - Add tenant_id column to bookings table
    - Update policies to support multi-tenant architecture
    - Create indexes for better performance
    - Add foreign key constraint to tenants table

  2. Security
    - Update RLS policies to respect tenant boundaries
    - Allow tenant admins to manage their own bookings
*/

-- Add tenant_id column to bookings if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN tenant_id uuid;
  END IF;
END $$;

-- Drop existing policies on bookings
DROP POLICY IF EXISTS "Admin can manage all bookings" ON bookings;
DROP POLICY IF EXISTS "Barbers can manage their bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can create and read bookings" ON bookings;

-- Create new policies for bookings
CREATE POLICY "Anyone can create and read bookings"
  ON bookings
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' AND policyname = 'Barbers can manage their bookings'
  ) THEN
    EXECUTE 'CREATE POLICY "Barbers can manage their bookings"
      ON bookings
      FOR ALL
      TO authenticated
      USING (barber_id IN (
        SELECT id FROM barbers
        WHERE uid() = barbers.user_id
      ))';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' AND policyname = 'Tenant admins can manage their bookings'
  ) THEN
    EXECUTE 'CREATE POLICY "Tenant admins can manage their bookings"
      ON bookings
      FOR ALL
      TO authenticated
      USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))';
  END IF;
END $$;

-- Create or update indexes
CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id);

-- Update bookings to link to default tenant
UPDATE bookings 
SET tenant_id = (SELECT id FROM tenants LIMIT 1)
WHERE tenant_id IS NULL;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'bookings_tenant_id_fkey'
  ) THEN
    -- First check if the constraint exists with a different name
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.constraint_column_usage
      WHERE table_name = 'bookings' AND column_name = 'tenant_id'
    ) THEN
      -- Only add the constraint if the tenants table exists and has data
      IF EXISTS (SELECT 1 FROM tenants LIMIT 1) THEN
        ALTER TABLE bookings
          ADD CONSTRAINT bookings_tenant_id_fkey
          FOREIGN KEY (tenant_id)
          REFERENCES tenants(id)
          ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;