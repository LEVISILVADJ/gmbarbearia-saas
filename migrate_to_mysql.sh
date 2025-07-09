#!/bin/bash

# Script para migrar o GM Barbearia SaaS do Supabase para MySQL
# Autor: Green Sistemas
# Data: 2025

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir mensagens
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

# Verificar se PHP está instalado
if ! command -v php &> /dev/null; then
    error "PHP não está instalado. Por favor, instale-o primeiro."
    exit 1
fi

# Verificar se o diretório do projeto existe
if [ ! -d "backend" ] || [ ! -d "supabase" ]; then
    error "Diretórios 'backend' e/ou 'supabase' não encontrados. Execute este script na raiz do projeto."
    exit 1
fi

log "Iniciando migração do Supabase para MySQL..."

# Verificar compatibilidade com aPanel
log "Verificando compatibilidade com aPanel..."
php check_aapanel_compatibility.php

# Perguntar se deseja continuar
read -p "Deseja continuar com a migração? (s/n): " CONTINUE
if [[ $CONTINUE != "s" && $CONTINUE != "S" ]]; then
    log "Migração cancelada pelo usuário."
    exit 0
fi

# Converter migrations do Supabase para MySQL
log "Convertendo migrations do Supabase para MySQL..."
php convert_migrations_to_mysql.php

# Configurar MySQL
log "Configurando MySQL..."
./setup_mysql_aapanel.sh

# Verificar se o arquivo .env existe
if [ ! -f "backend/.env" ]; then
    log "Criando arquivo .env..."
    cp backend/.env.example backend/.env
    
    # Solicitar informações para o .env
    read -p "Digite o domínio principal (ex: gmbarbearia.com): " DOMAIN
    read -p "Digite o subdomínio para a API (ex: api): " API_SUBDOMAIN
    
    # Atualizar .env
    sed -i "s/APP_URL=.*/APP_URL=https:\/\/${API_SUBDOMAIN}.${DOMAIN}/" backend/.env
    sed -i "s/FRONTEND_URL=.*/FRONTEND_URL=https:\/\/${DOMAIN}/" backend/.env
    
    # Copiar configurações do MySQL
    if [ -f "mysql_config.txt" ]; then
        log "Aplicando configurações do MySQL ao .env..."
        cat mysql_config.txt >> backend/.env
    fi
fi

# Gerar chave da aplicação
log "Gerando chave da aplicação Laravel..."
cd backend
php artisan key:generate

# Executar migrações
log "Executando migrações do banco de dados..."
php artisan migrate --force

# Executar seeders
log "Populando banco de dados com dados iniciais..."
php artisan db:seed --force

cd ..

success "Migração para MySQL concluída com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Configure os sites no painel do aPanel"
echo "2. Configure o SSL para os domínios"
echo "3. Configure o DNS wildcard para suportar subdomínios de clientes"
echo "4. Acesse o painel administrativo para verificar se tudo está funcionando"
echo ""
echo "Para mais detalhes, consulte o arquivo INSTALACAO_MYSQL_AAPANEL.md"
echo ""
echo "Para qualquer problema, entre em contato com o suporte da Green Sistemas:"
echo "- WhatsApp: (11) 95161-2874"
echo "- Email: contato@greensistemas.com"