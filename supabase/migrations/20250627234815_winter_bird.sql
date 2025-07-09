/*
  # Criar tabela de galeria de imagens

  1. New Tables
    - `gallery_images`
      - `id` (uuid, primary key)
      - `title` (text)
      - `image_url` (text)
      - `alt_text` (text)
      - `description` (text)
      - `order_index` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on gallery_images table
    - Admin can manage all gallery images
    - Public can read active gallery images

  3. Initial Data
    - Inserir as novas imagens da galeria
*/

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  description text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery_images table
CREATE POLICY "Admin can manage all gallery images"
  ON gallery_images
  FOR ALL
  TO authenticated
  USING (is_admin());

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_active ON gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON gallery_images(order_index);

-- Create trigger for updated_at
CREATE TRIGGER update_gallery_images_updated_at 
  BEFORE UPDATE ON gallery_images 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial gallery images with the new uploaded images
INSERT INTO gallery_images (title, image_url, alt_text, description, order_index, is_active) VALUES
('Degradê Moderno', '/378cb9c6-0863-42aa-ad7f-b2a338f13f2e.jpg', 'Corte degradê moderno com acabamento perfeito', 'Corte degradê moderno com acabamento perfeito e transições suaves', 1, true),
('Corte Clássico com Risco', '/d7f6cecd-0b2b-4a33-a217-abcaa4f68a12.jpg', 'Corte clássico com risco lateral e acabamento profissional', 'Corte clássico com risco lateral bem definido e acabamento profissional', 2, true),
('Corte Social Premium', '/a8278cba-7226-4554-baa9-4f6b7d287121.jpg', 'Corte social com degradê e risco bem definido', 'Corte social elegante com degradê e risco bem definido para ocasiões especiais', 3, true),
('Buzz Cut Moderno', '/965c0cf0-4972-4730-8d2b-c6ae3c3bc785.jpg', 'Corte buzz cut moderno com acabamento preciso', 'Corte buzz cut moderno com acabamento preciso e uniforme', 4, true),
('Pompadour Clássico', '/61580cfb-8ad0-44ae-925f-f9db36fde0e0.jpg', 'Corte pompadour com barba alinhada', 'Corte pompadour clássico com barba perfeitamente alinhada e acabamento premium', 5, true)
ON CONFLICT DO NOTHING;