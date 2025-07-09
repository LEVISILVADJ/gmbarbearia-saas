-- Add the new gallery image to the database
INSERT INTO gallery_images (title, image_url, alt_text, description, order_index, is_active) VALUES
('Corte Moderno com Barba', '/2efda2f9-f8f1-411a-b6e6-a81d3f7d39f4-copy.jpg', 'Corte moderno com barba bem alinhada e acabamento profissional', 'Corte moderno com barba perfeitamente alinhada e acabamento profissional de alta qualidade', 6, true)
ON CONFLICT DO NOTHING;