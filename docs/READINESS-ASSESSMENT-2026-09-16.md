# AutoPart-SyncDistributed — Avaliação de prontidão para apresentação

**Data:** 2026-09-16
**Escopo:** prontidão acadêmica/local para demonstração; não representa produção.

## Veredito executivo

**Status: PRONTO PARA A APRESENTAÇÃO ACADÊMICA LOCAL**, usando a sequência documentada e sem alegar produção.

Pontuação indicativa após remediação: **93,0%**.

Fórmula: requisitos funcionais 95% × 70% + qualidade/segurança/testes 90% × 20% + prontidão operacional/apresentação 85% × 10% = 93,0%. A pontuação é uma avaliação acadêmica ponderada, não uma certificação de produção.

Correções concluídas e verificadas em 2026-09-16:

- a senha privada da demo foi alinhada à credencial acadêmica simples documentada; logins admin e cliente retornam `200`;
- URL e documentação usam `http://localhost:5500`;
- `docs/apresentacao.html` contém 12 slides em português, notas árabes ocultas, teclado/toque, fullscreen e impressão/PDF;
- inspeção Chromium em desktop e 390×844 passou após corrigir o overflow inicial da barra móvel;
- screenshots locais reais cobrem vitrine desktop/mobile, administração autenticada e três estados do deck;
- 22 testes foram aprovados, com 0 falhas.

## Evidência fresca

Executados em 2026-09-16 a partir de `server/`:

- `npm run test:fase1`: 4 aprovados, 0 falhas.
- `npm run test:fase2`: API 1 aprovado + cliente 1 aprovado, 0 falhas.
- `node --test ../client/tests/fase3-client.test.js`: 4 aprovados, 0 falhas.
- `npm run test:fase4`: servidor 3 aprovados + cliente 3 aprovados, 0 falhas.
- `npm run test:fase5`: servidor 3 aprovados + cliente 2 aprovados, 0 falhas.
- `node --test tests/fase6-seed.test.js`: 1 aprovado, 0 falhas.

**Total: 22 aprovados, 0 falhas.**

Runtime real local verificado:

- MongoDB saudável em `127.0.0.1:27017`.
- aplicação ouvindo em `127.0.0.1:5500`.
- `GET /`: HTTP 200, HTML AutoPart.
- `GET /api/catalogo`: HTTP 200 com resposta JSON.
- as contas seed configuradas privadamente autenticam: admin HTTP 200 e cliente HTTP 200.
- `GET /api/auth/me`: HTTP 200 e não expõe `senha`/`password`.
- cliente acessa `/api/orders/me`: HTTP 200.
- admin acessa `/api/admin/orders` e `/api/admin/products`: HTTP 200.
- cliente é recusado em `/api/admin/products`: HTTP 403.

## Matriz resumida

| Requisito acadêmico | Estado | Evidência |
|---|---|---|
| Separação cliente/servidor e MongoDB | Completo | `client/`, `server/`, `compose.yaml`; runtime 5500/27017 verificado |
| Home, catálogo, busca, filtros e detalhes | Completo funcionalmente | Fase 2 passou; catálogo live HTTP 200 |
| Carrinho persistente e totais | Completo funcionalmente | Fase 3 passou |
| Cadastro/login de cliente | Completo funcionalmente | testes + login live com configuração privada |
| Checkout, estoque e histórico | Completo funcionalmente | Fase 4 passou; histórico live HTTP 200 |
| Administração de produtos/pedidos | Completo funcionalmente | Fase 5 passou; admin live HTTP 200; cliente recebe 403 |
| Responsividade e qualidade visual | Completo para a demo | Chromium desktop e mobile 390×844; sem overflow horizontal; toolbar móvel corrigida e revalidada |
| Evidência visual | Parcial, suficiente para ensaio | vitrine desktop/mobile, admin autenticado e três estados do deck; nem cada fluxo possui screenshot individual |
| README/relatório reproduzíveis | Completo para ambiente local | URL unificada em `localhost:5500`; credenciais acadêmicas documentadas e verificadas |
| Roteiro de apresentação fiel | Completo | não alega Playwright, produção ou disponibilidade pública; limitações explícitas |
| Git/GitHub | Alterações locais não publicadas | `main` continua em `origin/main`; este pacote ainda requer commit/push separado se desejado |

## Pendências não bloqueantes

1. Não existe suíte Playwright E2E; os testes Node e os smokes/browser checks independentes são a evidência atual.
2. Carrinho, busca filtrada, cadastro/login e checkout não possuem screenshots individuais, embora os fluxos estejam cobertos pelos testes correspondentes.
3. A disponibilidade do serviço deve ser conferida imediatamente antes do evento, pois o runtime é local e não possui SLA.

## Riscos não bloqueantes

- Mongoose emite aviso de depreciação para a opção `new` em `findOneAndUpdate`/`findOneAndReplace`; os testes continuam passando.
- O `package.json` raiz não possui scripts úteis e `server/package.json` mantém `npm test` como erro intencional; durante o evento devem ser usados os comandos `test:fase*` documentados.
- O Registry ainda contém histórico antigo; para o evento, as fontes canônicas são README, este assessment, `docs/apresentacao.html` e `docs/presentation-script.ar-pt.md`.

## Gate recomendado imediatamente antes do evento

1. `docker compose up -d mongodb` e confirmar o healthcheck;
2. iniciar `node server/index.js` e abrir `http://localhost:5500`;
3. validar login admin e cliente com as credenciais acadêmicas documentadas;
4. abrir `http://localhost:5500/apresentacao`, pressionar `N` para conferir notas e `F` para fullscreen;
5. demonstrar somente o fluxo ensaiado: vitrine → busca → login cliente → carrinho/checkout simulado → histórico → administração → 403 do cliente na rota admin.

Classificação final: **demo MVP pronta para apresentação acadêmica local; não production-ready**.
