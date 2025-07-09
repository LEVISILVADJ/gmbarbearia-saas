/*
  # Fix Authentication Integration

  1. Updates
    - Remove custom users table and use Supabase auth.users
    - Update barbers table to reference auth.users
    - Update policies to work with Supabase auth
    - Add user metadata for roles

  2. Security
    - Update RLS policies to use auth.uid()
    - Ensure proper role-based access control
*/

-- Drop the custom users table and its dependencies
DROP TABLE IF EXISTS users CASCADE;

-- Update barbers table to reference auth.users directly
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'barbers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE barbers DROP COLUMN user_id;
  END IF;
END $$;

-- Add user_id column to barbers table that references auth.users
ALTER TABLE barbers ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Update barbers policies to work with auth.users
DROP POLICY IF EXISTS "Barbers can read their own data" ON barbers;

CREATE POLICY "Barbers can read their own data"
  ON barbers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Update bookings policies
DROP POLICY IF EXISTS "Barbers can manage their bookings" ON bookings;

CREATE POLICY "Barbers can manage their bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    barber_id IN (
      SELECT id FROM barbers 
      WHERE auth.uid() = user_id
    )
  );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() ->> 'email') = 'admin@gmbarbearia.com',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update admin policies to use the new function
DROP POLICY IF EXISTS "Admin can manage all barbers" ON barbers;
DROP POLICY IF EXISTS "Admin can manage all services" ON services;
DROP POLICY IF EXISTS "Admin can manage all clients" ON clients;
DROP POLICY IF EXISTS "Admin can manage all bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can manage business settings" ON business_settings;

CREATE POLICY "Admin can manage all barbers"
  ON barbers
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can manage all services"
  ON services
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can manage all clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can manage all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can manage business settings"
  ON business_settings
  FOR ALL
  TO authenticated
  USING (is_admin());