# Matriz de evidências — checklist acadêmico

Legenda: **Verificado no código/configuração** identifica evidência estática; **Captura local 2026-09-16** identifica screenshot real produzido em sessão autorizada; **não capturada separadamente** mantém a limitação explícita.

| Item do checklist | Evidência exata | Situação |
|---|---|---|
| Identidade do projeto | `README.md`; `server/src/app.js` | Verificado no código/configuração |
| Separação cliente/servidor | `server/src/app.js`; `client/js/app.js` | Verificado no código/configuração |
| Página inicial | `client/js/app.js`, `App.pageStorefront()` | Verificado no código/configuração |
| Navegação | `client/js/app.js`, `App.go()` e `App.pageStorefront()` | Verificado no código/configuração |
| Catálogo | `client/js/app.js`, `loadCatalogue()`; `GET /api/catalogo` | Verificado no código/configuração |
| Detalhe de produto | `client/js/app.js`, `showProduct()`; detalhe sob `/api/catalogo` | Verificado no código/configuração |
| Busca e filtros no back-end | API `GET /api/catalogo` com busca, marca, modelo e categoria; `client/js/app.js`, `loadCatalogue()` | Verificado no código/configuração |
| Carrinho | `client/js/app.js`, `pageCart()`; estado local em `localStorage` | Verificado no código/configuração |
| Autenticação do cliente | `POST /api/auth/register`, `POST /api/auth/login`; `client/js/app.js`, `pageLogin()` | Verificado no código/configuração |
| Checkout e histórico | `/api/orders/checkout`, `/api/orders/me`, `/api/orders/:id`; `client/js/app.js`, `pageCart()` e `pageOrders()` | Verificado no código/configuração |
| Produtos e estoque | `client/js/app.js`, `pageParts()` e `pageAdminManagement()`; `server/seed.js`; `server/tests/fase6-seed.test.js` | Verificado no código/configuração |
| Usuários e pedidos | `client/js/app.js`, `pageAdminManagement()`; prefixo `/api/admin` | Verificado no código/configuração |
| Administração | `client/js/app.js`, `pageAdminManagement()`; `server/src/middleware/auth.js` | Verificado no código/configuração |
| Integração front/back | `client/js/app.js` e `server/src/app.js` | Verificado no código/configuração |
| MongoDB | `compose.yaml` (serviços documentados no README); `MONGODB_URI` em `.env.example` | Verificado no código/configuração |
| Responsividade | `client/js/app.js`; `docs/screenshots/autopart-storefront-desktop.png`; `docs/screenshots/autopart-storefront-mobile.png` | Captura local desktop/mobile 2026-09-16; sem overflow horizontal observado |
| Testes de aceitação | F1: 4 passaram, 0 falharam; F2: API 1 passou, 0 falhou e cliente estático 1 passou, 0 falhou; F3 cliente: 4 passaram, 0 falharam; F4: servidor 3 passaram, 0 falharam e cliente 3 passaram, 0 falharam; F5: servidor 3 passaram, 0 falharam e cliente 2 passaram, 0 falharam, com aviso não bloqueante de descontinuação Mongoose para `new` em `findOneAndUpdate`/`findOneAndReplace`; teste focado `node --test tests/fase6-seed.test.js`: 1 passou, 0 falhou, sem conexão MongoDB nem início de serviço | Resultados funcionais frescos observados independentemente |
| Entrega | `README.md`, `RELATORIO_PROJETO.md`, esta matriz, `docs/apresentacao.html` e `docs/screenshots/README.md` | Verificado nesta entrega documental |
| Evidência visual | `docs/screenshots/README.md` e seis PNGs listados | Parcial: vitrine desktop/mobile, administração e deck HTML capturados; não são seis provas funcionais separadas |
| Prova obrigatória 1 — peças com filtros | `client/js/app.js`, `loadCatalogue()`; `GET /api/catalogo`; `docs/screenshots/autopart-storefront-desktop.png` | Captura local da vitrine; estado filtrado não capturado separadamente |
| Prova obrigatória 2 — busca por nome/modelo/categoria | `client/js/app.js`, `loadCatalogue()`; `GET /api/catalogo` com busca, modelo e categoria | Não capturada separadamente; coberta por teste funcional F2 |
| Prova obrigatória 3 — carrinho funcional | `client/js/app.js`, `pageCart()`; estado do carrinho em `localStorage` | Não capturada separadamente; coberta por teste funcional F3 |
| Prova obrigatória 4 — registro/login de cliente | `client/js/app.js`, `pageLogin()`; `POST /api/auth/register` e `POST /api/auth/login` | Não capturada separadamente; login live verificado e testes F1/F3 aprovados |
| Prova obrigatória 5 — administração de produtos/pedidos | `client/js/app.js`, `pageAdminManagement()`; prefixo `/api/admin`; `docs/screenshots/autopart-admin-desktop.png` | Captura local 2026-09-16; admin 200 e cliente 403 verificados |
| Prova obrigatória 6 — checkout simulado | `client/js/app.js`, `pageCart()`; `POST /api/orders/checkout` | Não capturada separadamente; coberta por teste funcional F4 |
| Screenshot da vitrine desktop | `docs/screenshots/autopart-storefront-desktop.png` | Capturada em runtime local autorizado |
| Screenshot da vitrine mobile | `docs/screenshots/autopart-storefront-mobile.png` | Capturada em viewport 390×844 sem overflow horizontal |
| Screenshot da administração | `docs/screenshots/autopart-admin-desktop.png` | Capturada após login admin; nenhum token/senha visível |
| Screenshots da apresentação HTML | `docs/screenshots/apresentacao-*.png` | Capa desktop, notas árabes e slide mobile capturados |

## Limite da evidência

A matriz relaciona fontes, APIs, resultados funcionais frescos e capturas locais observadas independentemente, sem fabricar usuário real, URL pública ou aceitação de produção. F1, F2, F4 e F5 iniciam transitoriamente e depois limpam somente `mongodb-test`, como limpeza autocontida. Em 2026-09-16 foram capturadas a vitrine desktop/mobile, a administração autenticada e três estados do deck HTML; carrinho, busca filtrada, cadastro/login e checkout não receberam screenshots individuais. Não há runtime público, URL pública ou disponibilidade permanente alegada.

| Seed acadêmico local opt-in | `server/seed.js`; `server/tests/fase6-seed.test.js`; gate `server/index.js` (`SEED_DEMO_DATA === 'true'`) | Verificado no código/configuração; teste focado passou sem execução real do seed |
| Fase 6B — handoff e verificação | `docs/handoffs/autopart-fase-6/fase-6b-handoff.md`; resultados F1–F5 e teste focado registrados nesta matriz | Resultados funcionais frescos observados independentemente |

### Atualização F6B

O teste focado `node --test tests/fase6-seed.test.js` teve 1 passo aprovado e 0 falhas, sem conexão MongoDB nem início de serviço. Os resultados independentes frescos foram: F1 4/0; F2 API 1/0 e cliente estático 1/0; F3 cliente 4/0; F4 servidor 3/0 e cliente 3/0; F5 servidor 3/0 e cliente 2/0, com aviso não bloqueante de descontinuação Mongoose para `new` em `findOneAndUpdate`/`findOneAndReplace`. F1, F2, F4 e F5 iniciam transitoriamente e limpam somente `mongodb-test`; nenhum runtime duradouro ou público foi iniciado.

O seed não foi executado; não há seed por padrão e a ativação local continua exigindo opt-in deliberado. Não há captura visual, prova de runtime público, nem alegações de produção, pagamento ou logística.
