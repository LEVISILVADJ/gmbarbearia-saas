/*
  # Fix RLS policies for booking system

  1. Security Updates
    - Update clients table RLS policy to allow anonymous users to create clients
    - Update bookings table RLS policy to allow anonymous users to create bookings
    - Ensure proper data validation and security

  2. Policy Changes
    - Allow anonymous users to insert clients
    - Allow anonymous users to insert bookings
    - Maintain read restrictions for security
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Anyone can create clients" ON clients;
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;

-- Create new policies for clients table
CREATE POLICY "Allow anonymous client creation"
  ON clients
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated client creation"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create new policies for bookings table
CREATE POLICY "Allow anonymous booking creation"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated booking creation"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure anonymous users can read necessary data for booking
CREATE POLICY "Anonymous can read active barbers for booking"
  ON barbers
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Anonymous can read active services for booking"
  ON services
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Allow anonymous users to read business settings
CREATE POLICY "Anonymous can read business settings"
  ON business_settings
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to read active slideshow images
CREATE POLICY "Anonymous can read active slideshow images"
  ON slideshow_images
  FOR SELECT
  TO anon
  USING (is_active = true);