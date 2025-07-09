/*
  # Add Tenant Support to Gallery and Slideshow Tables

  1. Updates
    - Add tenant_id column to gallery_images and slideshow_images tables
    - Update policies to support multi-tenant architecture
    - Create indexes for better performance
    - Add foreign key constraints to tenants table

  2. Security
    - Update RLS policies to respect tenant boundaries
    - Allow tenant admins to manage their own gallery and slideshow images
*/

-- Add tenant_id column to gallery_images if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery_images' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE gallery_images ADD COLUMN tenant_id uuid;
  END IF;
END $$;

-- Add tenant_id column to slideshow_images if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'slideshow_images' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE slideshow_images ADD COLUMN tenant_id uuid;
  END IF;
END $$;

-- Drop existing policies on gallery_images
DROP POLICY IF EXISTS "Admin can manage all gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Anonymous can read active gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Authenticated can read active gallery images" ON gallery_images;

-- Create new policies for gallery_images
CREATE POLICY "Anonymous can read active gallery images"
  ON gallery_images
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can read active gallery images"
  ON gallery_images
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'gallery_images' AND policyname = 'Tenant admins can manage their gallery images'
  ) THEN
    EXECUTE 'CREATE POLICY "Tenant admins can manage their gallery images"
      ON gallery_images
      FOR ALL
      TO authenticated
      USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))';
  END IF;
END $$;

-- Drop existing policies on slideshow_images
DROP POLICY IF EXISTS "Admin can manage all slideshow images" ON slideshow_images;
DROP POLICY IF EXISTS "Anonymous can read active slideshow images" ON slideshow_images;
DROP POLICY IF EXISTS "Authenticated can read active slideshow images" ON slideshow_images;

-- Create new policies for slideshow_images
CREATE POLICY "Anonymous can read active slideshow images"
  ON slideshow_images
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can read active slideshow images"
  ON slideshow_images
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slideshow_images' AND policyname = 'Tenant admins can manage their slideshow images'
  ) THEN
    EXECUTE 'CREATE POLICY "Tenant admins can manage their slideshow images"
      ON slideshow_images
      FOR ALL
      TO authenticated
      USING ((tenant_id = current_tenant_id()) AND (is_admin() OR is_tenant_admin(tenant_id)))';
  END IF;
END $$;

-- Create or update indexes
CREATE INDEX IF NOT EXISTS idx_gallery_images_tenant ON gallery_images(tenant_id);
CREATE INDEX IF NOT EXISTS idx_slideshow_images_tenant ON slideshow_images(tenant_id);

-- Update gallery_images to link to default tenant
UPDATE gallery_images 
SET tenant_id = (SELECT id FROM tenants LIMIT 1)
WHERE tenant_id IS NULL;

-- Update slideshow_images to link to default tenant
UPDATE slideshow_images 
SET tenant_id = (SELECT id FROM tenants LIMIT 1)
WHERE tenant_id IS NULL;

-- Add foreign key constraint to gallery_images if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'gallery_images_tenant_id_fkey'
  ) THEN
    -- First check if the constraint exists with a different name
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.constraint_column_usage
      WHERE table_name = 'gallery_images' AND column_name = 'tenant_id'
    ) THEN
      -- Only add the constraint if the tenants table exists and has data
      IF EXISTS (SELECT 1 FROM tenants LIMIT 1) THEN
        ALTER TABLE gallery_images
          ADD CONSTRAINT gallery_images_tenant_id_fkey
          FOREIGN KEY (tenant_id)
          REFERENCES tenants(id)
          ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Add foreign key constraint to slideshow_images if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'slideshow_images_tenant_id_fkey'
  ) THEN
    -- First check if the constraint exists with a different name
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.constraint_column_usage
      WHERE table_name = 'slideshow_images' AND column_name = 'tenant_id'
    ) THEN
      -- Only add the constraint if the tenants table exists and has data
      IF EXISTS (SELECT 1 FROM tenants LIMIT 1) THEN
        ALTER TABLE slideshow_images
          ADD CONSTRAINT slideshow_images_tenant_id_fkey
          FOREIGN KEY (tenant_id)
          REFERENCES tenants(id)
          ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;