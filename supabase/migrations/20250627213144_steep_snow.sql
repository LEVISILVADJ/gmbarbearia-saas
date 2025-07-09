-- Update business settings with new logo
UPDATE business_settings 
SET logo_url = '/WhatsApp Image 2025-06-26 at 08.22.png'
WHERE id IS NOT NULL;

-- Update slideshow images with new logo reference if needed
-- (keeping existing slideshow images as they are interior photos)