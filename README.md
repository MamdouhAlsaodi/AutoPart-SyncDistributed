# AutoPart-SyncDistributed

Protótipo acadêmico local de catálogo, estoque e pedidos simulados de autopeças. A implementação **atual** usa **Node.js + Express 5**, cliente em HTML/CSS/JavaScript e **MongoDB + Mongoose**. O plano inicial que mencionava PHP/Slim e SQL Server não descreve este código.

> Escopo: demonstração acadêmica local, não loja em produção. Checkout não processa pagamentos, entregas ou integrações externas.

## Estrutura e framework

- `server/index.js`: inicializa a conexão MongoDB e o servidor HTTP.
- `server/src/app.js`: monta as rotas Express, respostas JSON, cliente estático e apresentação.
- `server/src/routes/`, `controllers/`, `models/`, `middleware/`: API, regras de acesso e persistência.
- `client/`: interface consumidora da API; `docs/apresentacao.html`: slides da demonstração.
- [`docs/FRAMEWORK.md`](docs/FRAMEWORK.md): descrição técnica do framework e sua aplicação no projeto, com referências ao código e limites reais.

O navegador e a API são separados logicamente, mas o **mesmo processo Express serve também os arquivos estáticos**. MongoDB é um serviço separado; `compose.yaml` configura uma instância local de membro único com replica set para as transações do checkout. Isto não é um cluster distribuído nem alta disponibilidade.

## Requisitos

Node.js e npm compatíveis com as dependências em `server/package-lock.json`, Docker com Compose para o MongoDB local. Para a demonstração, use um navegador moderno. O projeto não exige PHP, Composer, Slim, SQL Server ou SSMS.

## Executar localmente

Na raiz do repositório:

```bash
npm ci --prefix server
docker compose up -d --wait mongodb
cp .env.example .env
# Edite .env antes de iniciar: JWT_SECRET deve ser privado, aleatório e ter >=32 caracteres.
# Para carregar contas e peças de demonstração, habilite SEED_DEMO_DATA=true
# e defina SEED_DEMO_PASSWORD para uma senha local de demonstração.
node server/index.js
```

`server/src/app.js` carrega `.env` a partir do diretório de execução: rode o comando na **raiz**. O endereço padrão, quando `PORT` não está definido, é `http://127.0.0.1:3000`; `.env.example` também define `PORT=3000`. A apresentação fica em `/apresentacao` no mesmo host/porta. Se você escolher `PORT=5500`, abra `http://127.0.0.1:5500`. `HOST` aceita outro bind somente quando deliberadamente configurado; o padrão é loopback. Não publique essa demo na internet.

Variáveis importantes (valores de exemplo, nunca credenciais reais no Git):

| Variável | Uso |
|---|---|
| `MONGODB_URI` | URI MongoDB local; padrão no código `mongodb://127.0.0.1:27017/autopart_sync`. |
| `JWT_SECRET` | Segredo privado para tokens de autenticação; configure antes de usar login. |
| `PORT`, `HOST` | Porta (`3000` no exemplo) e endereço de bind (`127.0.0.1` por padrão). |
| `SEED_DEMO_DATA`, `SEED_DEMO_PASSWORD` | Seed opcional: somente com `SEED_DEMO_DATA=true` e senha local explícita. |

Quando habilitado, o seed usa as contas `admin.demo@autopart.test` e `cliente.demo@autopart.test` com a senha **que você configurou localmente**. Nunca versione `.env` nem reutilize essa senha como `JWT_SECRET`.

## Recursos e rotas principais

- Catálogo público: `GET /api/catalogo`, `GET /api/catalogo/:id`.
- Cadastro, login e sessão: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- Cliente autenticado: `POST /api/orders/checkout`, `GET /api/orders/me`, `GET /api/orders/:id`.
- Administrador autenticado: `/api/admin/products` e `/api/admin/orders` (listagem, detalhe e operações implementadas nas rotas).
- Verificação básica do processo: `GET /api/ping`. A resposta informa `db: MongoDB`, **mas não testa a saúde da conexão**.

O checkout recalcula preços no servidor, cria o pedido e reduz o estoque dentro de uma transação MongoDB; requer replica set. A interface e a API não substituem regras de pagamento real.

## Testes

Com o MongoDB de teste **isolado** de `compose.yaml` e dependências instaladas:

```bash
docker compose up -d --wait mongodb-test
cd server
npm run test:fase1
npm run test:fase2
node --test ../client/tests/fase3-client.test.js
npm run test:fase4
npm run test:fase5
node --test tests/fase6-seed.test.js
```

Os testes de banco usam `127.0.0.1:27018/autopart_fase1_test` com `NODE_ENV=test`; não aponte testes destrutivos para o banco de demonstração. `npm test` não é a suíte configurada neste repositório. Os resultados devem ser verificados novamente antes de cada apresentação; um relatório anterior está em [`docs/READINESS-ASSESSMENT-2026-09-16.md`](docs/READINESS-ASSESSMENT-2026-09-16.md).

## Material para o professor

Comece pelo [framework técnico e decisões arquiteturais](docs/FRAMEWORK.md), seguido do [relatório do projeto](RELATORIO_PROJETO.md) e da [apresentação HTML](docs/apresentacao.html). A apresentação é acessível no navegador em `/apresentacao` quando a aplicação local está rodando. Consulte também o [roteiro da apresentação](docs/presentation-script.ar-pt.md). O projeto já tem uma implementação demonstrável, mas não declara implantação pública ou disponibilidade contínua.
