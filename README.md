# AutoPart-SyncDistributed

O AutoPart-SyncDistributed é um protótipo acadêmico para a disciplina de Negócios Eletrônicos. A aplicação organiza a consulta a um catálogo de autopeças, o controle de estoque e o registro de pedidos simulados. Utiliza Node.js com Express 5 no servidor, HTML/CSS/JavaScript na interface e MongoDB com Mongoose para persistência.

O fluxo de pedidos representa uma solicitação no ambiente de demonstração, sem processamento de pagamentos, faturamento ou entrega. A execução documentada é local; o projeto não constitui uma loja em produção.

## Estrutura e framework

- `server/index.js`: inicializa a conexão MongoDB e o servidor HTTP.
- `server/src/app.js`: monta as rotas Express, respostas JSON, cliente estático e apresentação.
- `server/src/routes/`, `controllers/`, `models/`, `middleware/`: API, regras de acesso e persistência.
- `client/`: interface consumidora da API; `docs/apresentacao.html`: slides da demonstração.
- [`docs/FRAMEWORK.md`](docs/FRAMEWORK.md): análise da estrutura da aplicação e do fluxo de pedidos para a disciplina.
- [`docs/DEMO-DATA.md`](docs/DEMO-DATA.md): carga grande, contas fictícias e serviços locais da máquina de apresentação.

O navegador acessa a API por requisições HTTP, enquanto o processo Express disponibiliza também os arquivos estáticos da interface. O MongoDB opera como serviço local separado. O `compose.yaml` configura um replica set de membro único para as transações do pedido; a aplicação não dispõe de alta disponibilidade.

## Identidade visual

A marca AutoPart usa uma engrenagem com peça hexagonal e a letra A: [`client/favicon.svg`](client/favicon.svg) é o símbolo do app, e o logotipo horizontal está em [`client/logo-autopart.svg`](client/logo-autopart.svg) e [`client/logo-autopart.png`](client/logo-autopart.png). O catálogo, a área administrativa e os slides compartilham grafite, cobre e teal; [`DESIGN.md`](DESIGN.md) e [`tokens.json`](tokens.json) documentam os tokens e contrastes. A apresentação em `/apresentacao` tem a marca no cabeçalho e na primeira página do PDF.

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
- Administrador autenticado: `/api/admin/products` e `/api/admin/orders` (listagem, detalhe e operações implementadas nas rotas). A interface de gestão inclui **Movimentações** (histórico, entrada e saída) e **Relatórios** (estoque, últimas 100 movimentações e pedidos simulados do administrador); consulte [`docs/DEMO-DATA.md`](docs/DEMO-DATA.md) para os limites dos dados históricos.
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

## Documentação acadêmica

A [análise da estrutura e do fluxo de pedidos](docs/FRAMEWORK.md) apresenta a aplicação no contexto da disciplina de Negócios Eletrônicos. O [relatório do projeto](RELATORIO_PROJETO.md) registra o escopo e as evidências da implementação. A apresentação em português está disponível como [slides HTML interativos](docs/apresentacao.html), abertos em `/apresentacao` durante a execução local, e como [PDF para apresentar sem servidor](docs/apresentacao.pdf). Há um [roteiro de fala em português e árabe](docs/presentation-script.ar-pt.md) correspondente aos 12 slides e uma [explicação do projeto em árabe](docs/EXPLICACAO-AR.md). Nenhum desses materiais constitui evidência de implantação pública ou operação comercial.
