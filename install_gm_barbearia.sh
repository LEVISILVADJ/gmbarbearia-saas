#!/bin/bash

# Script de instalação do GM Barbearia SaaS no aPanel
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
log "Iniciando instalação do GM Barbearia SaaS..."
read -p "Digite o domínio principal (ex: gmbarbearia.com): " DOMAIN
read -p "Digite o subdomínio para a API (ex: api): " API_SUBDOMAIN
read -p "Digite o nome do banco de dados: " DB_NAME
read -p "Digite o usuário do banco de dados: " DB_USER
read -p "Digite a senha do banco de dados: " DB_PASSWORD
read -p "Digite o e-mail do administrador: " ADMIN_EMAIL
read -p "Digite a senha do administrador: " ADMIN_PASSWORD
read -p "Digite o nome da empresa: " ADMIN_NAME

API_DOMAIN="${API_SUBDOMAIN}.${DOMAIN}"
WEB_ROOT="/www/wwwroot"
FRONTEND_DIR="${WEB_ROOT}/${DOMAIN}"
BACKEND_DIR="${WEB_ROOT}/${API_DOMAIN}"

# Criar diretórios
log "Criando diretórios..."
mkdir -p "${FRONTEND_DIR}"
mkdir -p "${BACKEND_DIR}"

# Criar banco de dados
log "Criando banco de dados MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -e "FLUSH PRIVILEGES;"

# Configurar backend (Laravel)
log "Configurando backend Laravel..."
cd "${BACKEND_DIR}"

# Clonar repositório ou extrair arquivos
# Aqui você pode adicionar o comando para clonar seu repositório Git
# ou extrair um arquivo zip com o código do backend

# Instalar dependências do Composer
log "Instalando dependências do Composer..."
composer install --no-dev --optimize-autoloader

# Configurar .env
log "Configurando arquivo .env..."
cp .env.example .env
sed -i "s/APP_URL=.*/APP_URL=https:\/\/${API_DOMAIN}/" .env
sed -i "s/FRONTEND_URL=.*/FRONTEND_URL=https:\/\/${DOMAIN}/" .env
sed -i "s/DB_DATABASE=.*/DB_DATABASE=${DB_NAME}/" .env
sed -i "s/DB_USERNAME=.*/DB_USERNAME=${DB_USER}/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" .env
sed -i "s/ADMIN_EMAIL=.*/ADMIN_EMAIL=${ADMIN_EMAIL}/" .env
sed -i "s/ADMIN_PASSWORD=.*/ADMIN_PASSWORD=${ADMIN_PASSWORD}/" .env
sed -i "s/ADMIN_NAME=.*/ADMIN_NAME=\"${ADMIN_NAME}\"/" .env

# Gerar chave da aplicação
php artisan key:generate

# Executar migrações
log "Executando migrações do banco de dados..."
php artisan migrate --force

# Configurar permissões
log "Configurando permissões..."
chown -R www:www "${BACKEND_DIR}"
chmod -R 755 "${BACKEND_DIR}"
chmod -R 775 "${BACKEND_DIR}/storage"
chmod -R 775 "${BACKEND_DIR}/bootstrap/cache"

# Configurar frontend (React)
log "Configurando frontend React..."
cd "${FRONTEND_DIR}"

# Clonar repositório ou extrair arquivos
# Aqui você pode adicionar o comando para clonar seu repositório Git
# ou extrair um arquivo zip com o código do frontend

# Configurar .htaccess para SPA
cat > "${FRONTEND_DIR}/.htaccess" << 'EOL'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOL

# Configurar permissões do frontend
chown -R www:www "${FRONTEND_DIR}"
chmod -R 755 "${FRONTEND_DIR}"

# Configurar cron job para tarefas agendadas
log "Configurando cron job..."
echo "* * * * * cd ${BACKEND_DIR} && php artisan schedule:run >> /dev/null 2>&1" > /var/spool/cron/root

# Configurar sites no aPanel
log "Configurando sites no aPanel..."

# Aqui você precisaria usar a API do aPanel ou comandos específicos
# para criar os sites. Como isso varia dependendo da versão do aPanel,
# deixamos como um lembrete para configuração manual.

success "Instalação concluída com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Configure os sites no painel do aPanel:"
echo "   - Domínio principal: ${DOMAIN}"
echo "   - Subdomínio da API: ${API_DOMAIN}"
echo "2. Configure o SSL para ambos os domínios"
echo "3. Configure o DNS wildcard para suportar subdomínios de clientes"
echo "4. Acesse o painel administrativo em https://${DOMAIN}/admin"
echo "   - Email: ${ADMIN_EMAIL}"
echo "   - Senha: (a senha que você definiu)"
echo ""
echo "Para qualquer problema, consulte a documentação ou entre em contato com o suporte."