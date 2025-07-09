# Guia de Instalação do GM Barbearia SaaS no aPanel

Este guia fornece instruções detalhadas para instalar o sistema GM Barbearia SaaS em um servidor com aPanel.

## Requisitos

- Servidor com aPanel instalado
- PHP 8.1 ou superior
- MySQL 5.7 ou superior
- Composer
- Node.js e npm (para build do frontend)
- Domínio configurado no aPanel

## 1. Preparação do Ambiente

### 1.1. Criar Banco de Dados MySQL

1. Acesse o painel do aPanel
2. Navegue até "Banco de Dados" > "MySQL"
3. Clique em "Adicionar Banco de Dados"
4. Preencha:
   - Nome do banco: `gm_barbearia_saas`
   - Usuário: crie um novo ou selecione um existente
   - Senha: defina uma senha segura
5. Clique em "Salvar"

### 1.2. Configurar Domínios

1. No aPanel, vá para "Sites"
2. Configure:
   - Domínio principal: `gmbarbearia.com`
   - Subdomínio para API: `api.gmbarbearia.com`

### 1.3. Configurar DNS para Multi-Tenancy

1. Acesse seu provedor de DNS
2. Adicione um registro A wildcard:
   ```
   *.gmbarbearia.com  A  [IP do seu servidor]
   ```

## 2. Instalação do Backend (Laravel)

### 2.1. Fazer Upload dos Arquivos

1. Acesse o Gerenciador de Arquivos do aPanel
2. Navegue até o diretório do site da API: `/www/wwwroot/api.gmbarbearia.com`
3. Faça upload dos arquivos do backend (pasta `backend` do projeto)

Alternativamente, use FTP ou SSH:
```bash
cd /www/wwwroot/api.gmbarbearia.com
# Se estiver usando Git
git clone https://github.com/seu-repositorio/gm-barbearia-backend.git .
# Ou faça upload via FTP/SFTP
```

### 2.2. Instalar Dependências

```bash
cd /www/wwwroot/api.gmbarbearia.com
composer install --no-dev --optimize-autoloader
```

### 2.3. Configurar Ambiente

1. Crie o arquivo .env:
```bash
cp .env.example .env
```

2. Edite o arquivo .env:
```bash
nano .env
```

Configure:
```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.gmbarbearia.com
FRONTEND_URL=https://gmbarbearia.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=gm_barbearia_saas
DB_USERNAME=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql

TENANT_DATABASE_PREFIX=tenant_

MP_PUBLIC_KEY=sua_chave_publica_mercadopago
MP_ACCESS_TOKEN=seu_token_acesso_mercadopago
MP_WEBHOOK_SECRET=seu_segredo_webhook_mercadopago

SUBSCRIPTION_BASIC_PRICE=99.90
SUBSCRIPTION_PREMIUM_PRICE=149.90
TRIAL_DAYS=10

ADMIN_EMAIL=admin@greensistemas.com
ADMIN_PASSWORD=sua_senha_admin_segura
ADMIN_NAME="Green Sistemas"
```

3. Gere a chave da aplicação:
```bash
php artisan key:generate
```

### 2.4. Configurar Banco de Dados

```bash
php artisan migrate --force
```

### 2.5. Configurar Permissões

```bash
chown -R www:www /www/wwwroot/api.gmbarbearia.com
chmod -R 755 /www/wwwroot/api.gmbarbearia.com
chmod -R 775 /www/wwwroot/api.gmbarbearia.com/storage
chmod -R 775 /www/wwwroot/api.gmbarbearia.com/bootstrap/cache
```

### 2.6. Configurar Cron Job

1. No aPanel, vá para "Cron Jobs"
2. Adicione um novo cron job:
```
* * * * * cd /www/wwwroot/api.gmbarbearia.com && php artisan schedule:run >> /dev/null 2>&1
```

### 2.7. Configurar Rewrite Rules

1. No aPanel, vá para "Sites" > selecione o site da API
2. Clique em "Configurações do Site"
3. Configure o diretório raiz para apontar para a pasta `public` do Laravel:
   - Diretório raiz: /www/wwwroot/api.gmbarbearia.com/public
4. Salve as alterações

## 3. Instalação do Frontend (React)

### 3.1. Fazer Upload dos Arquivos

1. Acesse o Gerenciador de Arquivos do aPanel
2. Navegue até o diretório do site principal: `/www/wwwroot/gmbarbearia.com`
3. Faça upload dos arquivos do frontend (pasta `dist` após o build)

### 3.2. Configurar .htaccess

Crie um arquivo `.htaccess` na raiz do site:

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 3.3. Configurar Permissões

```bash
chown -R www:www /www/wwwroot/gmbarbearia.com
chmod -R 755 /www/wwwroot/gmbarbearia.com
```

## 4. Configuração do SSL

### 4.1. Configurar SSL para o Domínio Principal

1. No aPanel, vá para "Sites" > selecione o site principal
2. Clique em "SSL"
3. Selecione "Let's Encrypt" e siga as instruções

### 4.2. Configurar SSL para o Subdomínio da API

1. No aPanel, vá para "Sites" > selecione o site da API
2. Clique em "SSL"
3. Selecione "Let's Encrypt" e siga as instruções

### 4.3. Configurar SSL para Wildcard (Opcional)

Para suportar SSL em todos os subdomínios, você pode precisar de um certificado wildcard.
Isso geralmente requer validação DNS, então consulte a documentação do aPanel ou use um serviço externo.

## 5. Configuração do MercadoPago

1. Crie uma conta no MercadoPago (caso não tenha)
2. Acesse o [Dashboard do MercadoPago](https://www.mercadopago.com.br/developers/panel)
3. Crie uma nova aplicação
4. Obtenha as credenciais (Public Key e Access Token)
5. Configure o webhook para receber notificações:
   - URL do webhook: https://api.gmbarbearia.com/api/webhooks/mercadopago
   - Eventos a serem notificados: payment, subscription

6. Atualize o arquivo `.env` do backend com as credenciais:
   ```
   MP_PUBLIC_KEY=sua_chave_publica
   MP_ACCESS_TOKEN=seu_token_acesso
   MP_WEBHOOK_SECRET=seu_segredo_webhook
   ```

## 6. Verificação Final

1. Acesse o frontend: https://gmbarbearia.com
2. Verifique se a página inicial carrega corretamente
3. Tente criar uma nova conta de barbearia
4. Verifique se o subdomínio está funcionando: https://[subdomain].gmbarbearia.com
5. Teste o login no painel administrativo: https://gmbarbearia.com/admin
   - Use as credenciais de admin configuradas no .env

## 7. Solução de Problemas Comuns

### 7.1. Problemas de Permissão

Se encontrar erros de permissão:
```bash
chown -R www:www /www/wwwroot/api.gmbarbearia.com
chown -R www:www /www/wwwroot/gmbarbearia.com
chmod -R 755 /www/wwwroot/api.gmbarbearia.com
chmod -R 755 /www/wwwroot/gmbarbearia.com
chmod -R 775 /www/wwwroot/api.gmbarbearia.com/storage
chmod -R 775 /www/wwwroot/api.gmbarbearia.com/bootstrap/cache
```

### 7.2. Problemas com Banco de Dados

Se as migrações falharem:
```bash
cd /www/wwwroot/api.gmbarbearia.com
php artisan migrate:fresh --force
```

### 7.3. Problemas com Cache

Se encontrar problemas com cache:
```bash
cd /www/wwwroot/api.gmbarbearia.com
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### 7.4. Logs de Erro

Verifique os logs para identificar problemas:
```bash
tail -f /www/wwwroot/api.gmbarbearia.com/storage/logs/laravel.log
```

## 8. Manutenção

### 8.1. Backup Regular

Configure backups regulares do banco de dados e arquivos:
1. No aPanel, vá para "Backup"
2. Configure backups automáticos para os diretórios:
   - /www/wwwroot/gmbarbearia.com
   - /www/wwwroot/api.gmbarbearia.com
3. Configure backups do banco de dados MySQL

### 8.2. Atualizações

Para atualizar o sistema:
1. Faça backup de todos os arquivos e banco de dados
2. Atualize os arquivos do backend e frontend
3. Execute as migrações pendentes:
```bash
cd /www/wwwroot/api.gmbarbearia.com
php artisan migrate --force
```

## Suporte

Para qualquer problema ou dúvida, entre em contato com o suporte da Green Sistemas:
- WhatsApp: (11) 95161-2874
- Email: contato@greensistemas.com