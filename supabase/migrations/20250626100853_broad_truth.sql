/*
  # Fix RLS policies for anonymous booking creation

  1. Security Updates
    - Allow anonymous users to create clients and bookings
    - Ensure proper access for the booking system
    - Maintain security while enabling functionality

  2. Policy Changes
    - Fix clients table policies for anonymous access
    - Fix bookings table policies for anonymous access
    - Ensure all necessary read permissions are in place
*/

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Allow anonymous client creation" ON clients;
DROP POLICY IF EXISTS "Allow authenticated client creation" ON clients;
DROP POLICY IF EXISTS "Allow anonymous booking creation" ON bookings;
DROP POLICY IF EXISTS "Allow authenticated booking creation" ON bookings;
DROP POLICY IF EXISTS "Public can read bookings for availability" ON bookings;

-- Create comprehensive policies for clients table
CREATE POLICY "Anonymous can create clients"
  ON clients
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can create clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create comprehensive policies for bookings table
CREATE POLICY "Anonymous can create bookings"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anonymous can read bookings"
  ON bookings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can read bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure anonymous users can read all necessary data for booking
DROP POLICY IF EXISTS "Anonymous can read active barbers for booking" ON barbers;
DROP POLICY IF EXISTS "Public can read active barbers" ON barbers;

CREATE POLICY "Anonymous can read active barbers"
  ON barbers
  FOR SELECT
  TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS "Anonymous can read active services for booking" ON services;
DROP POLICY IF EXISTS "Public can read active services" ON services;

CREATE POLICY "Anonymous can read active services"
  ON services
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Ensure business settings are readable
DROP POLICY IF EXISTS "Anonymous can read business settings" ON business_settings;
DROP POLICY IF EXISTS "Public can read business settings" ON business_settings;

CREATE POLICY "Anonymous can read business settings"
  ON business_settings
  FOR SELECT
  TO anon
  USING (true);

-- Ensure slideshow images are readable
DROP POLICY IF EXISTS "Anonymous can read active slideshow images" ON slideshow_images;
DROP POLICY IF EXISTS "Public can read active slideshow images" ON slideshow_images;

CREATE POLICY "Anonymous can read active slideshow images"
  ON slideshow_images
  FOR SELECT
  TO anon
  USING (is_active = true);