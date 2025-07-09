/*
  # Create Auth Users and Link Barbers

  1. Create a function to handle user creation via Supabase auth
  2. Update barbers table to link with auth users
  3. Create admin role checking function
*/

-- First, let's add the user_id column to barbers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'barbers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE barbers ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'barbers_user_id_fkey'
  ) THEN
    ALTER TABLE barbers ADD CONSTRAINT barbers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;

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

-- Create function to get current user ID
CREATE OR REPLACE FUNCTION uid()
RETURNS uuid AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to use the new functions
DROP POLICY IF EXISTS "Admin can manage all barbers" ON barbers;
DROP POLICY IF EXISTS "Barbers can read their own data" ON barbers;

CREATE POLICY "Admin can manage all barbers"
  ON barbers
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Barbers can read their own data"
  ON barbers
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

-- Update other policies
DROP POLICY IF EXISTS "Admin can manage all services" ON services;
CREATE POLICY "Admin can manage all services"
  ON services
  FOR ALL
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admin can manage all clients" ON clients;
CREATE POLICY "Admin can manage all clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admin can manage all bookings" ON bookings;
DROP POLICY IF EXISTS "Barbers can manage their bookings" ON bookings;

CREATE POLICY "Admin can manage all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Barbers can manage their bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    barber_id IN (
      SELECT id FROM barbers 
      WHERE uid() = user_id
    )
  );

DROP POLICY IF EXISTS "Admin can manage business settings" ON business_settings;
CREATE POLICY "Admin can manage business settings"
  ON business_settings
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Create a function to help with user signup (for development)
CREATE OR REPLACE FUNCTION create_barber_user(
  barber_email text,
  barber_password text,
  barber_name text
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- This function should be called from the application layer
  -- It's here for reference but won't work in migrations
  RETURN null;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;