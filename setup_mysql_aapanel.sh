#!/bin/bash

# Script para configurar o MySQL no aPanel para o GM Barbearia SaaS
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

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    error "Este script precisa ser executado como root"
    exit 1
fi

# Verificar se o aPanel está instalado
if [ ! -d "/www/server/panel" ]; then
    error "aPanel não encontrado. Este script é específico para servidores com aPanel."
    exit 1
fi

# Configurações
log "Iniciando configuração do MySQL para GM Barbearia SaaS..."
read -p "Digite o nome do banco de dados principal: " DB_NAME
read -p "Digite o prefixo para bancos de dados de tenants: " DB_PREFIX
read -p "Digite o usuário do banco de dados: " DB_USER
read -p "Digite a senha do banco de dados: " DB_PASSWORD

# Verificar se o MySQL está instalado
if ! command -v mysql &> /dev/null; then
    error "MySQL não está instalado. Por favor, instale-o primeiro através do aPanel."
    exit 1
fi

# Criar banco de dados principal
log "Criando banco de dados principal ${DB_NAME}..."
mysql -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if [ $? -ne 0 ]; then
    error "Falha ao criar o banco de dados principal."
    exit 1
fi

# Criar usuário e conceder privilégios
log "Criando usuário ${DB_USER} e concedendo privilégios..."
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';"

# Conceder privilégios para criar novos bancos de dados (para multi-tenancy)
log "Concedendo privilégios para criar novos bancos de dados..."
mysql -e "GRANT CREATE ON *.* TO '${DB_USER}'@'localhost';"

# Conceder privilégios para bancos de dados de tenants (usando padrão de nome)
log "Concedendo privilégios para bancos de dados de tenants..."
mysql -e "GRANT ALL PRIVILEGES ON \`${DB_PREFIX}%\`.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Verificar se tudo foi configurado corretamente
log "Verificando configuração..."
RESULT=$(mysql -e "SHOW GRANTS FOR '${DB_USER}'@'localhost';" 2>&1)
if [[ $RESULT == *"ERROR"* ]]; then
    error "Falha ao verificar privilégios do usuário. Verifique manualmente."
else
    success "Usuário e privilégios configurados com sucesso!"
fi

# Criar arquivo de configuração para o Laravel
log "Criando arquivo de configuração para o Laravel..."
cat > mysql_config.txt << EOL
# Configurações do MySQL para o Laravel (.env)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=${DB_NAME}
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Configurações de Tenant
TENANT_DATABASE_PREFIX=${DB_PREFIX}
EOL

success "Configuração do MySQL concluída com sucesso!"
echo ""
echo "As configurações para o arquivo .env do Laravel foram salvas em mysql_config.txt"
echo "Copie essas configurações para o arquivo .env do seu projeto Laravel."
echo ""
echo "Próximos passos:"
echo "1. Importe o esquema do banco de dados usando as migrações do Laravel"
echo "2. Configure o Laravel para usar o MySQL"
echo "3. Teste a conexão com o banco de dados"
echo ""
echo "Para qualquer problema, consulte a documentação ou entre em contato com o suporte."