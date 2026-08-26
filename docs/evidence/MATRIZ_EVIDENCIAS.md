# Matriz de evidências — checklist acadêmico

Legenda: **Verificado no código/configuração** identifica evidência estática; **Não capturada nesta Fase 6A** não representa screenshot existente.

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
| Responsividade | `client/js/app.js` e estilos servidos pela aplicação; captura visual pendente | Parcial; screenshot não capturada nesta Fase 6A |
| Testes de aceitação | F1: 4 passaram, 0 falharam; F2: API 1 passou, 0 falhou e cliente estático 1 passou, 0 falhou; F3 cliente: 4 passaram, 0 falharam; F4: servidor 3 passaram, 0 falharam e cliente 3 passaram, 0 falharam; F5: servidor 3 passaram, 0 falharam e cliente 2 passaram, 0 falharam, com aviso não bloqueante de descontinuação Mongoose para `new` em `findOneAndUpdate`/`findOneAndReplace`; teste focado `node --test tests/fase6-seed.test.js`: 1 passou, 0 falhou, sem conexão MongoDB nem início de serviço | Resultados funcionais frescos observados independentemente |
| Entrega | `README.md`, `RELATORIO_PROJETO.md`, esta matriz e `docs/screenshots/README.md` | Verificado nesta entrega documental |
| Evidência visual | `docs/screenshots/README.md` | Não capturada nesta Fase 6A |
| Prova obrigatória 1 — peças com filtros | `client/js/app.js`, `loadCatalogue()`; `GET /api/catalogo` com filtros | Screenshot `Não capturada nesta Fase 6A` |
| Prova obrigatória 2 — busca por nome/modelo/categoria | `client/js/app.js`, `loadCatalogue()`; `GET /api/catalogo` com busca, modelo e categoria | Screenshot `Não capturada nesta Fase 6A` |
| Prova obrigatória 3 — carrinho funcional | `client/js/app.js`, `pageCart()`; estado do carrinho em `localStorage` | Screenshot `Não capturada nesta Fase 6A` |
| Prova obrigatória 4 — registro/login de cliente | `client/js/app.js`, `pageLogin()`; `POST /api/auth/register` e `POST /api/auth/login` | Screenshot `Não capturada nesta Fase 6A` |
| Prova obrigatória 5 — administração de produtos/pedidos | `client/js/app.js`, `pageAdminManagement()` e `pageParts()`; prefixo `/api/admin` | Screenshot `Não capturada nesta Fase 6A` |
| Prova obrigatória 6 — checkout simulado | `client/js/app.js`, `pageCart()`; `POST /api/orders/checkout` | Screenshot `Não capturada nesta Fase 6A` |
| Screenshot da prova obrigatória 1 | `docs/screenshots/README.md` | Não capturada nesta Fase 6A |
| Screenshot da prova obrigatória 2 | `docs/screenshots/README.md` | Não capturada nesta Fase 6A |
| Screenshot da prova obrigatória 3 | `docs/screenshots/README.md` | Não capturada nesta Fase 6A |
| Screenshot da prova obrigatória 4 | `docs/screenshots/README.md` | Não capturada nesta Fase 6A |
| Screenshot da prova obrigatória 5 | `docs/screenshots/README.md` | Não capturada nesta Fase 6A |
| Screenshot da prova obrigatória 6 | `docs/screenshots/README.md` | Não capturada nesta Fase 6A |

## Limite da evidência

A matriz relaciona fontes, APIs e os resultados funcionais frescos observados independentemente, sem fabricar screenshot, usuário real, URL pública ou aceitação visual. F1, F2, F4 e F5 iniciam transitoriamente e depois limpam somente `mongodb-test`, como limpeza autocontida; não foi iniciado runtime duradouro ou público. Os screenshots permanecem `Não capturada nesta Fase 6A`; não há runtime público, URL pública ou aceitação visual ao vivo.

| Seed acadêmico local opt-in | `server/seed.js`; `server/tests/fase6-seed.test.js`; gate `server/index.js` (`SEED_DEMO_DATA === 'true'`) | Verificado no código/configuração; teste focado passou sem execução real do seed |
| Fase 6B — handoff e verificação | `docs/handoffs/autopart-fase-6/fase-6b-handoff.md`; resultados F1–F5 e teste focado registrados nesta matriz | Resultados funcionais frescos observados independentemente |

### Atualização F6B

O teste focado `node --test tests/fase6-seed.test.js` teve 1 passo aprovado e 0 falhas, sem conexão MongoDB nem início de serviço. Os resultados independentes frescos foram: F1 4/0; F2 API 1/0 e cliente estático 1/0; F3 cliente 4/0; F4 servidor 3/0 e cliente 3/0; F5 servidor 3/0 e cliente 2/0, com aviso não bloqueante de descontinuação Mongoose para `new` em `findOneAndUpdate`/`findOneAndReplace`. F1, F2, F4 e F5 iniciam transitoriamente e limpam somente `mongodb-test`; nenhum runtime duradouro ou público foi iniciado.

O seed não foi executado; não há seed por padrão e a ativação local continua exigindo opt-in deliberado. Não há captura visual, prova de runtime público, nem alegações de produção, pagamento ou logística.
