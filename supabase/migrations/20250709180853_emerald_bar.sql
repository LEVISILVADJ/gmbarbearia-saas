/*
  # Criação de funções auxiliares

  1. Funções
    - `update_updated_at_column()` - Atualiza o campo updated_at automaticamente
    - `is_admin()` - Verifica se o usuário atual é administrador
    - `is_tenant_admin(tenant_id)` - Verifica se o usuário atual é administrador do tenant
    - `current_tenant_id()` - Retorna o ID do tenant atual baseado no subdomínio
    - `update_client_last_visit()` - Atualiza a data da última visita do cliente quando um agendamento é concluído
*/

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se o usuário atual é administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    SELECT u.is_admin INTO is_admin
    FROM users u
    WHERE u.id = auth.uid();
    
    RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário atual é administrador do tenant
CREATE OR REPLACE FUNCTION is_tenant_admin(tenant_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM tenant_users tu
        WHERE tu.tenant_id = $1
        AND tu.user_id = auth.uid()
        AND tu.role IN ('owner', 'admin')
    ) INTO is_admin;
    
    RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o ID do tenant atual baseado no subdomínio
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid AS $$
DECLARE
    tenant_id uuid;
    host_header text;
    subdomain text;
BEGIN
    -- Obter o cabeçalho Host da requisição
    host_header := current_setting('request.headers', true)::json->>'host';
    
    -- Se não houver cabeçalho Host, retornar NULL
    IF host_header IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Extrair o subdomínio
    subdomain := split_part(host_header, '.', 1);
    
    -- Se o subdomínio for 'www' ou 'api', retornar NULL
    IF subdomain IN ('www', 'api') THEN
        RETURN NULL;
    END IF;
    
    -- Buscar o tenant pelo subdomínio
    SELECT id INTO tenant_id
    FROM tenants
    WHERE subdomain = subdomain;
    
    RETURN tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar a data da última visita do cliente quando um agendamento é concluído
CREATE OR REPLACE FUNCTION update_client_last_visit()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o status foi alterado para 'concluido', atualizar a data da última visita do cliente
    IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status <> 'concluido') THEN
        UPDATE clients
        SET last_visit_date = CURRENT_DATE
        WHERE id = NEW.client_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;