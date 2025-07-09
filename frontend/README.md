# GM Barbearia SaaS - Frontend

Frontend em React para o sistema SaaS da GM Barbearia.

## Requisitos

- Node.js >= 16
- npm ou yarn

## Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/gm-barbearia-saas.git
cd gm-barbearia-saas/frontend
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

## Configuração para Produção

1. Crie o build de produção
```bash
npm run build
# ou
yarn build
```

2. Os arquivos gerados estarão na pasta `dist` e podem ser servidos por qualquer servidor web estático

## Configuração para aPanel

1. Faça o build do projeto conforme descrito acima

2. Faça upload dos arquivos da pasta `dist` para o diretório configurado no seu aPanel

3. Configure o servidor web (Apache/Nginx) para servir os arquivos estáticos e redirecionar todas as rotas para o `index.html`

### Exemplo de configuração para Nginx:

```nginx
server {
    listen 80;
    server_name saas.gmbarbearia.com;
    root /caminho/para/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Exemplo de configuração para Apache:

Crie um arquivo `.htaccess` na pasta `dist`:

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

## Variáveis de Ambiente

- `VITE_API_URL` - URL da API backend (ex: http://api.gmbarbearia.com/api)
- `VITE_SUPABASE_URL` - URL do Supabase (para compatibilidade com o sistema existente)
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase (para compatibilidade com o sistema existente)
- `VITE_WHATSAPP_API_URL` - URL da API do WhatsApp (para compatibilidade com o sistema existente)

## Estrutura do Projeto

- `src/components` - Componentes reutilizáveis
- `src/pages` - Páginas da aplicação
- `src/services` - Serviços para comunicação com a API
- `src/contexts` - Contextos React para gerenciamento de estado
- `src/utils` - Funções utilitárias

## Páginas Principais

- `/` - Página inicial
- `/login` - Login de usuário
- `/register` - Registro de novo usuário e tenant
- `/dashboard` - Dashboard do tenant
- `/select-tenant` - Seleção de tenant (para usuários com múltiplos tenants)
- `/subscription` - Página de assinatura
- `/admin` - Dashboard administrativo (apenas para admins)

## Licença

Proprietária - Green Sistemas