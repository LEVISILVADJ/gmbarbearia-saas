/*
  # Sistema de Slideshow

  1. New Tables
    - `slideshow_images`
      - `id` (uuid, primary key)
      - `title` (text)
      - `image_url` (text)
      - `alt_text` (text)
      - `order_index` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on slideshow_images table
    - Admin can manage all slideshow images
    - Public can read active slideshow images
*/

-- Create slideshow_images table
CREATE TABLE IF NOT EXISTS slideshow_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE slideshow_images ENABLE ROW LEVEL SECURITY;

-- Create policies for slideshow_images table
CREATE POLICY "Admin can manage all slideshow images"
  ON slideshow_images
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Public can read active slideshow images"
  ON slideshow_images
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can read active slideshow images"
  ON slideshow_images
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_slideshow_images_active ON slideshow_images(is_active);
CREATE INDEX IF NOT EXISTS idx_slideshow_images_order ON slideshow_images(order_index);

-- Create trigger for updated_at
CREATE TRIGGER update_slideshow_images_updated_at 
  BEFORE UPDATE ON slideshow_images 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial slideshow images
INSERT INTO slideshow_images (title, image_url, alt_text, order_index, is_active) VALUES
('Interior da Barbearia 1', '/03d0d17b-50d9-4901-8828-3920ab89437f.jpg', 'Vista geral do interior da barbearia com cadeiras e espelhos', 1, true),
('Interior da Barbearia 2', '/85d9542f-928a-4f42-a117-f19c5423163c.jpg', 'Ambiente moderno da barbearia com iluminação profissional', 2, true),
('Estações de Trabalho', '/77542818-87ad-4321-9523-ac3fe48f4209.jpg', 'Estações de trabalho dos barbeiros com espelhos e equipamentos', 3, true),
('Área de Atendimento', '/5b5ec10a-7930-4bf9-830d-b83c0292129b.jpg', 'Área principal de atendimento aos clientes', 4, true),
('Ambiente Completo', '/447f176b-41ee-497f-9d13-011dd5475284.jpg', 'Vista completa do ambiente da barbearia', 5, true)
ON CONFLICT DO NOTHING;