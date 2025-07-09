# GM Barbearia SaaS - Backend

Backend em Laravel para o sistema SaaS da GM Barbearia.

## Requisitos

- PHP >= 8.1
- Composer
- PostgreSQL >= 13
- Extensões PHP: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML

## Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/gm-barbearia-saas.git
cd gm-barbearia-saas/backend
```

2. Instale as dependências
```bash
composer install
```

3. Configure o ambiente
```bash
cp .env.example .env
php artisan key:generate
```

4. Configure o arquivo `.env` com suas credenciais de banco de dados e outras configurações

5. Execute as migrações
```bash
php artisan migrate
```

6. Inicie o servidor
```bash
php artisan serve
```

## Configuração para aPanel

1. Crie um banco de dados PostgreSQL no aPanel

2. Configure o arquivo `.env` com as credenciais do seu banco de dados

3. Configure o servidor web (Apache/Nginx) para apontar para a pasta `public` do projeto

4. Configure as permissões de arquivos:
```bash
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

5. Configure o cron job para as tarefas agendadas:
```
* * * * * cd /caminho/para/seu/projeto && php artisan schedule:run >> /dev/null 2>&1
```

## Estrutura Multi-Tenant

O sistema utiliza a biblioteca `stancl/tenancy` para implementar multi-tenancy com bancos de dados separados para cada cliente.

Cada tenant (barbearia) terá seu próprio banco de dados com o prefixo configurado em `TENANT_DATABASE_PREFIX`.

## Integração com MercadoPago

Para habilitar pagamentos, configure as variáveis de ambiente do MercadoPago:

```
MP_PUBLIC_KEY=sua_chave_publica
MP_ACCESS_TOKEN=seu_token_de_acesso
MP_WEBHOOK_SECRET=seu_segredo_de_webhook
```

## Comandos Úteis

- Criar um novo tenant: `php artisan tenants:create`
- Executar migrações para todos os tenants: `php artisan tenants:migrate`
- Executar seed para todos os tenants: `php artisan tenants:seed`
- Listar todos os tenants: `php artisan tenants:list`

## Documentação da API

### Autenticação

- `POST /api/register` - Registrar novo usuário e tenant
- `POST /api/login` - Login de usuário
- `POST /api/logout` - Logout de usuário (requer autenticação)
- `POST /api/check-subdomain` - Verificar disponibilidade de subdomínio

### Tenants

- `GET /api/tenant/{subdomain}` - Obter informações do tenant (requer autenticação)
- `PUT /api/tenant/{subdomain}` - Atualizar configurações do tenant (requer autenticação)

### Assinaturas

- `POST /api/tenant/{subdomain}/subscribe` - Iniciar assinatura (requer autenticação)
- `POST /api/tenant/{subdomain}/cancel-subscription` - Cancelar assinatura (requer autenticação)

### Admin

- `GET /api/admin/tenants` - Listar todos os tenants (requer admin)
- `GET /api/admin/tenants/{id}` - Obter detalhes de um tenant (requer admin)
- `PUT /api/admin/tenants/{id}` - Atualizar um tenant (requer admin)
- `POST /api/admin/tenants/{id}/extend-trial` - Estender período de teste (requer admin)
- `POST /api/admin/tenants/{id}/toggle-active` - Ativar/desativar tenant (requer admin)
- `GET /api/admin/stats` - Obter estatísticas (requer admin)

### Webhooks

- `POST /api/webhooks/mercadopago` - Webhook do MercadoPago

## Licença

Proprietária - Green Sistemas