# AutoPart-SyncDistributed

Aplicação web de catálogo e gestão de peças automotivas, organizada para execução local.

## Demonstração acadêmica local (somente local/demo)

Instruções verificadas para iniciar a demonstração local:

```bash
docker compose up -d mongodb
cp .env.example .env
# Edite .env: defina um JWT_SECRET privado com pelo menos 32 caracteres.
# Também defina:
# SEED_DEMO_DATA=true
# SEED_DEMO_PASSWORD=AutoPartDemo2026!
node server/index.js
```

Depois, abra <http://localhost:3000>. O endereço é somente local; não há URL pública documentada.

Contas genéricas da demonstração acadêmica local:

- `admin.demo@autopart.test` — perfil administrador
- `cliente.demo@autopart.test` — perfil cliente
- Senha acadêmica pública para ambas: `AutoPartDemo2026!`

Essas contas e essa senha são exclusivamente para uso local/demo acadêmico. Não use a senha em produção. `JWT_SECRET` deve ser privado, independente e não deve ser a senha pública da demonstração. Não versione `.env`.

## Arquitetura

O servidor em `server/` é uma aplicação Node.js/Express. O cliente é uma interface estática em Vanilla JavaScript, servida pelo servidor a partir de `server/src/app.js`. Os dados são persistidos em MongoDB por meio do Mongoose.

O `compose.yaml` define serviços MongoDB locais de membro único: `mongodb`, exposto apenas em loopback na porta 27017, e `mongodb-test`, exposto apenas em loopback na porta 27018.

## Configuração local

As variáveis necessárias em runtime são `MONGODB_URI`, `JWT_SECRET` e `PORT`. `SEED_DEMO_DATA` é `false` por padrão; quando habilitado deliberadamente, `SEED_DEMO_PASSWORD` também é necessário. O arquivo `.env` deve permanecer privado e fora do controle de versão.

## Funcionalidades e API

- Catálogo público: `GET /api/catalogo`.
- Autenticação: `POST /api/auth/register` e `POST /api/auth/login`.
- Checkout e histórico autenticados: `/api/orders/checkout`, `/api/orders/me` e `/api/orders/:id`.
- API administrativa protegida: prefixo `/api/admin`.

O checkout é explicitamente simulado: não há alegação de pagamento, entrega, logística ou integração com comércio externo.

## Testes documentados

Execute os comandos a partir de `server/`:

```bash
npm run test:fase1
npm run test:fase2
node --test ../client/tests/fase3-client.test.js
npm run test:fase4
npm run test:fase5
node --test tests/fase6-seed.test.js
```

## Limites

O projeto é uma base local de catálogo, inventário, autenticação e pedidos simulados. Não são afirmados publicação, operação comercial externa ou disponibilidade de ambiente público.
