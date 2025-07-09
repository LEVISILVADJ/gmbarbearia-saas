-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Tenant admins can manage their barbers" ON barbers;
DROP POLICY IF EXISTS "Barbers can read their own data" ON barbers;
DROP POLICY IF EXISTS "Anonymous can read active barbers" ON barbers;
DROP POLICY IF EXISTS "Admins can create barbers" ON barbers;

-- Create more permissive policy for tenant admins
CREATE POLICY "Tenant admins can manage their barbers"
  ON barbers
  FOR ALL
  TO authenticated
  USING (
    -- Allow if user is admin or tenant admin
    (is_admin() OR is_tenant_admin(tenant_id))
    OR 
    -- Allow if no tenant_id is set (for initial creation)
    (tenant_id IS NULL)
    OR
    -- Allow if tenant_id matches current tenant
    (tenant_id = current_tenant_id())
  )
  WITH CHECK (
    -- Same conditions for insert/update
    (is_admin() OR is_tenant_admin(tenant_id))
    OR 
    (tenant_id IS NULL)
    OR
    (tenant_id = current_tenant_id())
  );

-- Add a specific policy for barber creation by admins
CREATE POLICY "Admins can create barbers"
  ON barbers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if user is a system admin
    is_admin()
    OR
    -- Allow if user is tenant admin and tenant_id matches or is null
    (is_tenant_admin(tenant_id) OR tenant_id IS NULL)
  );

-- Ensure barbers can still read their own data
CREATE POLICY "Barbers can read their own data" 
  ON barbers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anonymous users to read active barbers (for public booking)
CREATE POLICY "Anonymous can read active barbers"
  ON barbers
  FOR SELECT
  TO anon
  USING (is_active = true);