# GM Barbearia SaaS

Sistema SaaS completo para barbearias, permitindo que múltiplos clientes utilizem a plataforma com suas próprias personalizações.

## Estrutura do Projeto

O projeto é dividido em duas partes:

1. **Frontend (React)** - Interface do usuário
2. **Backend (Laravel)** - API e gerenciamento de tenants

## Funcionalidades

- **Multi-tenancy**: Cada cliente tem seu próprio ambiente isolado
- **Período de teste**: 10 dias gratuitos para novos clientes
- **Assinatura**: Integração com MercadoPago para pagamentos recorrentes
- **Personalização**: Cada cliente pode personalizar cores, logo e informações da barbearia
- **Painel Administrativo**: Gerenciamento completo de clientes, assinaturas e configurações

## Instalação

### Requisitos

- PHP >= 8.1
- Node.js >= 16
- PostgreSQL >= 13
- Composer
- npm ou yarn

### Backend (Laravel)

1. Navegue até a pasta do backend
```bash
cd backend
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

### Frontend (React)

1. Navegue até a pasta do frontend
```bash
cd frontend
```

2. Instale as dependências
```bash
npm install
# ou
yarn
```

3. Configure o ambiente
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

## Configuração para aPanel

### Backend

1. Faça upload dos arquivos do backend para o diretório configurado no seu aPanel

2. Configure o ambiente:
```bash
cp .env.example .env
php artisan key:generate
```

3. Configure o arquivo `.env` com suas credenciais de banco de dados e outras configurações

4. Configure as permissões de arquivos:
```bash
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

5. Configure o servidor web (Apache/Nginx) para apontar para a pasta `public` do projeto

6. Configure o cron job para as tarefas agendadas:
```
* * * * * cd /caminho/para/seu/projeto && php artisan schedule:run >> /dev/null 2>&1
```

### Frontend

1. Crie o build de produção
```bash
npm run build
# ou
yarn build
```

2. Faça upload dos arquivos da pasta `dist` para o diretório configurado no seu aPanel

3. Configure o servidor web (Apache/Nginx) para servir os arquivos estáticos e redirecionar todas as rotas para o `index.html`

## Configuração de Subdomínios

Para que o sistema SaaS funcione corretamente com subdomínios, você precisará configurar seu servidor DNS para apontar todos os subdomínios para o mesmo servidor.

### Exemplo de configuração DNS:

1. Configure um registro A para o domínio principal:
```
gmbarbearia.com. IN A 123.456.789.10
```

2. Configure um registro wildcard para os subdomínios:
```
*.gmbarbearia.com. IN A 123.456.789.10
```

3. Configure seu servidor web para processar os subdomínios corretamente.

## Integração com MercadoPago

Para habilitar pagamentos, configure as variáveis de ambiente do MercadoPago no backend:

```
MP_PUBLIC_KEY=sua_chave_publica
MP_ACCESS_TOKEN=seu_token_de_acesso
MP_WEBHOOK_SECRET=seu_segredo_de_webhook
```

## Licença

Proprietária - Green Sistemas