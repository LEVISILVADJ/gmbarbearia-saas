/*
  # Corrigir Campos de Descrição e Endereço

  1. Updates
    - Garantir que os campos description e footer_address sejam independentes
    - Atualizar registros existentes para ter valores padrão se estiverem nulos
    - Melhorar a clareza dos campos para evitar confusão
*/

-- Garantir que os campos description e footer_address existam
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'description'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN description text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'footer_address'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN footer_address text;
  END IF;
END $$;

-- Atualizar registros existentes para ter valores padrão se estiverem nulos
UPDATE business_settings
SET 
  description = COALESCE(
    description, 
    'Com mais de 10 anos de experiência, a GM Barbearia é referência em cortes masculinos na região. Combinamos técnicas tradicionais com tendências modernas para oferecer o melhor serviço aos nossos clientes.'
  ),
  footer_address = COALESCE(
    footer_address, 
    SPLIT_PART(address, ',', 1)
  )
WHERE 
  description IS NULL OR 
  footer_address IS NULL;

-- Adicionar comentários às colunas para melhorar a clareza
COMMENT ON COLUMN business_settings.description IS 'Descrição completa da barbearia que aparece na seção Sobre da página inicial';
COMMENT ON COLUMN business_settings.footer_address IS 'Endereço resumido que aparece apenas no rodapé da página';
COMMENT ON COLUMN business_settings.address IS 'Endereço completo da barbearia (para uso em contatos e documentos)';