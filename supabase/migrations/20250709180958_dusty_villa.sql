/*
  # Seed de dados iniciais

  Este arquivo contém dados iniciais para o sistema, incluindo:
  1. Usuário administrador
  2. Tenant de exemplo (GM Barbearia)
  3. Dados de exemplo para o tenant (barbeiros, serviços, etc.)
*/

-- Inserir usuário administrador
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@greensistemas.com',
  '{"name": "Green Sistemas", "role": "admin"}',
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Obter ID do usuário admin
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@greensistemas.com';
  
  -- Inserir na tabela users
  INSERT INTO users (id, email, name, is_admin, created_at, updated_at)
  VALUES (
    admin_id,
    'admin@greensistemas.com',
    'Green Sistemas',
    true,
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Criar tenant de exemplo (GM Barbearia)
  INSERT INTO tenants (
    id,
    name,
    subdomain,
    logo_url,
    primary_color,
    secondary_color,
    theme_mode,
    owner_email,
    owner_name,
    phone,
    is_active,
    trial_ends_at,
    subscription_status,
    subscription_plan,
    subscription_price,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    'GM Barbearia',
    'demo',
    '/WhatsApp Image 2025-06-26 at 08.22.png',
    '#f59e0b',
    '#ea580c',
    'dark',
    'admin@greensistemas.com',
    'Green Sistemas',
    '(11) 95161-2874',
    true,
    now() + interval '365 days', -- Período de teste longo para o demo
    'trial',
    'premium',
    149.90,
    now(),
    now()
  ) ON CONFLICT (subdomain) DO NOTHING;
END $$;

-- Obter ID do tenant demo
DO $$
DECLARE
  tenant_id uuid;
  admin_id uuid;
BEGIN
  SELECT id INTO tenant_id FROM tenants WHERE subdomain = 'demo';
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@greensistemas.com';
  
  -- Associar admin ao tenant
  INSERT INTO tenant_users (tenant_id, user_id, role, created_at, updated_at)
  VALUES (
    tenant_id,
    admin_id,
    'owner',
    now(),
    now()
  ) ON CONFLICT (tenant_id, user_id) DO NOTHING;
  
  -- Inserir barbeiros de exemplo
  INSERT INTO barbers (name, email, phone, photo_url, specialties, rating, experience_years, is_active, tenant_id)
  VALUES
    ('Carlos Silva', 'carlos@gmbarbearia.com', '(11) 99999-0001', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300', ARRAY['Corte Clássico', 'Barba', 'Degradê'], 4.9, 8, true, tenant_id),
    ('João Santos', 'joao@gmbarbearia.com', '(11) 99999-0002', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300', ARRAY['Corte Moderno', 'Sobrancelha', 'Barba'], 4.8, 6, true, tenant_id),
    ('Pedro Costa', 'pedro@gmbarbearia.com', '(11) 99999-0003', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300', ARRAY['Corte Social', 'Degradê', 'Barba Completa'], 4.7, 5, true, tenant_id);
  
  -- Inserir serviços de exemplo
  INSERT INTO services (name, description, price, duration_minutes, icon, is_active, tenant_id)
  VALUES
    ('Corte Tradicional', 'Corte clássico com acabamento perfeito', 25.00, 30, '✂️', true, tenant_id),
    ('Corte + Barba', 'Corte completo com barba alinhada', 40.00, 45, '🧔', true, tenant_id),
    ('Barba Completa', 'Barba feita com navalha e acabamento', 20.00, 25, '🪒', true, tenant_id),
    ('Sobrancelha', 'Alinhamento e design de sobrancelhas', 10.00, 15, '👁️', true, tenant_id);
  
  -- Inserir configurações da barbearia
  INSERT INTO business_settings (
    business_name,
    phone,
    email,
    address,
    description,
    footer_address,
    opening_hours,
    logo_url,
    primary_color,
    secondary_color,
    theme_mode,
    tenant_id
  )
  VALUES (
    'GM Barbearia',
    '(11) 99999-9999',
    'contato@gmbarbearia.com',
    'Rua das Flores, 123 - Centro, São Paulo - SP',
    'Com mais de 10 anos de experiência, a GM Barbearia é referência em cortes masculinos na região. Combinamos técnicas tradicionais com tendências modernas para oferecer o melhor serviço aos nossos clientes.',
    'Rua das Flores, 123 - Centro',
    '{
      "monday": {"open": "08:00", "close": "18:00", "closed": false},
      "tuesday": {"open": "08:00", "close": "18:00", "closed": false},
      "wednesday": {"open": "08:00", "close": "18:00", "closed": false},
      "thursday": {"open": "08:00", "close": "18:00", "closed": false},
      "friday": {"open": "08:00", "close": "18:00", "closed": false},
      "saturday": {"open": "08:00", "close": "16:00", "closed": false},
      "sunday": {"open": "08:00", "close": "16:00", "closed": true}
    }',
    '/WhatsApp Image 2025-06-26 at 08.22.png',
    '#f59e0b',
    '#ea580c',
    'dark',
    tenant_id
  );
  
  -- Inserir imagens do slideshow
  INSERT INTO slideshow_images (title, image_url, alt_text, order_index, is_active, tenant_id)
  VALUES
    ('Interior da Barbearia 1', '/03d0d17b-50d9-4901-8828-3920ab89437f.jpg', 'Vista geral do interior da barbearia com cadeiras e espelhos', 1, true, tenant_id),
    ('Interior da Barbearia 2', '/85d9542f-928a-4f42-a117-f19c5423163c.jpg', 'Ambiente moderno da barbearia com iluminação profissional', 2, true, tenant_id);
  
  -- Inserir imagens da galeria
  INSERT INTO gallery_images (title, image_url, alt_text, description, order_index, is_active, tenant_id)
  VALUES
    ('Degradê Moderno', '/378cb9c6-0863-42aa-ad7f-b2a338f13f2e.jpg', 'Corte degradê moderno com acabamento perfeito', 'Corte degradê moderno com acabamento perfeito e transições suaves', 1, true, tenant_id),
    ('Corte Clássico com Risco', '/d7f6cecd-0b2b-4a33-a217-abcaa4f68a12.jpg', 'Corte clássico com risco lateral e acabamento profissional', 'Corte clássico com risco lateral bem definido e acabamento profissional', 2, true, tenant_id);
  
  -- Inserir mensagem de aniversário padrão
  INSERT INTO birthday_messages (title, message_template, is_active, tenant_id)
  VALUES (
    'Mensagem de Aniversário Padrão',
    '🎂 *Feliz Aniversário, {client_name}!* 🎉

Toda a equipe da GM Barbearia deseja a você um dia incrível cheio de felicidade e realizações!

Como presente especial, queremos oferecer um *desconto de 20%* em qualquer serviço da nossa barbearia válido durante todo o mês do seu aniversário.

Basta mencionar este desconto ao agendar seu horário.

Agradecemos por fazer parte da nossa história e esperamos continuar cuidando do seu visual por muitos anos!

Abraços,
Equipe GM Barbearia ✂️',
    true,
    tenant_id
  );
  
  -- Inserir mensagem de retenção padrão
  INSERT INTO retention_messages (title, message_template, days_inactive, is_active, tenant_id)
  VALUES (
    'Mensagem de Retorno - 60 dias',
    '👋 *Olá, {client_name}!*

Sentimos sua falta na GM Barbearia! Já faz mais de {days_inactive} dias desde sua última visita.

Que tal agendar um horário para renovar seu visual? Estamos com novidades e promoções especiais para você.

*Oferta Especial de Retorno:* 15% de desconto em qualquer serviço!

Para agendar, é só responder esta mensagem ou acessar nosso site.

Esperamos vê-lo em breve!

Equipe GM Barbearia ✂️',
    60,
    true,
    tenant_id
  );
END $$;