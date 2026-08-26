# Plano executável — AutoPart-SyncDistributed (Fase 0–6)

## Regras de execução
Fase 1 só começa após aceite explícito da Fase 0. Fases posteriores não estão completas nem autorizadas por este documento. Cada gate exige evidência fresca; ausência de MongoDB real impede alegar persistência.

## Fase 0 — baseline, PDR e plano
- **Objetivo/resultado permitido:** documentar a linha de base segura, PDR, plano e handoff; nenhuma alteração de aplicação.
- **Pré-requisitos:** fontes verificadas e escopo documental aprovado.
- **Escopo:** mapear Express em `server/src/app.js`, controllers/routes/models atuais, cliente Vanilla JS e lacunas; registrar rastreabilidade.
- **Não-objetivos:** editar código, testes, dependências, ownership, banco, Git, deploy ou corrigir artefatos alheios.
- **Gate:** PDR, PLAN, handoff e relatório existem; diff documental sem erros; checks de sintaxe abaixo passam.
- **Testes/evidência:** `node --check` nos arquivos listados; `git status`, HEAD e `git diff --check`.

## Fase 1 — domínio e persistência
- **Objetivo/resultado:** completar `Part`, cliente e `Order` em MongoDB/Mongoose, preservando inventário.
- **Dependências:** aceite Fase 0; ownership `server:server`; MongoDB de teste isolado.
- **Escopo:** compatibilidade, imagem/referência, perfil cliente, pedido com snapshots, seeds seguros e APIs/modelos.
- **Não-objetivos:** storefront final, pagamento real, deploy.
- **Gate:** testes de modelo/API comprovam validação, isolamento e persistência em alvo MongoDB isolado.
- **Evidência:** testes focados, consultas pós-restart e logs sem segredos.

## Fase 2 — storefront
- **Objetivo/resultado:** home, catálogo público, detalhe, busca e filtros vindos do backend.
- **Dependências:** Fase 1 aceita e contratos de produto publicados.
- **Escopo:** navegação, categorias, cards, compatibilidade, loading/vazio/erro e API pública.
- **Não-objetivos:** checkout, administração completa.
- **Gate:** pesquisa e filtro retornam dados reais, sem estoque hard-coded, em desktop e mobile.
- **Evidência:** testes API/browser e screenshots responsivos.

## Fase 3 — carrinho e contas
- **Objetivo/resultado:** carrinho funcional e ciclo de cadastro/login de cliente.
- **Dependências:** Fases 1–2 aceitas.
- **Escopo:** adicionar/remover/quantidade/totais, preservação durante uso, validação, bcryptjs, JWT e separação de papéis.
- **Não-objetivos:** confirmar pedido ou pagamento.
- **Gate:** refresh mantém carrinho; credencial inválida falha; resposta não expõe senha.
- **Evidência:** testes API/browser e screenshots.

## Fase 4 — checkout e histórico
- **Objetivo/resultado:** checkout simulado, pedido e histórico com estoque seguro.
- **Dependências:** Fase 3; MongoDB real de teste isolado.
- **Escopo:** recalcular total no servidor, validar disponibilidade, persistir snapshots/status e reduzir estoque consistentemente.
- **Não-objetivos:** pagamento/entrega reais.
- **Gate:** preço do navegador não prevalece, estoque não fica negativo e pedido aparece só para o cliente correto.
- **Evidência:** testes concorrência/estoque, consulta MongoDB e screenshots.

## Fase 5 — administração
- **Objetivo/resultado:** gestão autorizada de produtos, estoque e pedidos.
- **Dependências:** Fase 4 aceita.
- **Escopo:** CRUD, preço/estoque, listagem e transição de status, 403 para cliente.
- **Não-objetivos:** novos papéis ou operações fora do caso.
- **Gate:** alterações administrativas refletem no storefront e cliente não acessa rotas/dados admin.
- **Evidência:** testes de autorização e fluxo browser.

## Fase 6 — aceite e entrega
- **Objetivo/resultado:** reunir testes, relatório em português, README, evidências visuais e prontidão para GitHub.
- **Dependências:** Fases 1–5 aceitas.
- **Escopo:** aceitação ponta a ponta, desktop/mobile, screenshots, documentação, referências e auditoria.
- **Não-objetivos:** adicionar funcionalidades durante a entrega.
- **Gate:** toda linha do PDR tem evidência; nenhuma prova persistente sem execução MongoDB real.
- **Evidência:** pacote final revisado.

## Estratégia determinística de verificação
Agora: executar somente `git status --short --branch`, `git rev-parse HEAD`, `git diff --check -- PDR.md PLAN.md docs/handoffs/autopart-fase-0` e `node --check` em `server/index.js`, `server/src/app.js`, os quatro controllers e `client/js/api.js`, `client/js/app.js`. Os scripts `npm test` de server/client intencionalmente terminam com “no test specified” e não são critério positivo.

Depois: testes focados de API/modelo contra MongoDB de teste isolado (nunca dados de desenvolvimento), testes browser de aceitação, screenshots em viewports responsivos e auditoria de respostas/segredos. Não executar comandos mutadores de banco em Fase 0.

## Release/readiness
Fazer revisão de diff com escopo, scan de segredos, atualizar README/relatório/screenshots e registrar resultados. Fase 0 não faz commit, push ou deploy. Antes de qualquer GitHub readiness, exigir gate final separado: testes e evidências frescos, diff/ownership revisados, ausência de segredos e autorização humana explícita.

## Baseline obrigatório registrado
Root `/home/server/Projects/AutoPart-SyncDistributed/`; commit atual `17fb317ccab835b37e5f79421db72436d7c49a84` em `main`; ownership observado `server:server`; `PDR.md` ausente; `PLAN.md` era documento não rastreado; worktree contém mudanças/artefatos não relacionados, incluindo metadados `node_modules`, `client/node_modules/`, `node_modules/tailwindcss/`, `server/check*`, `server/test_history_api.js` e `server/server.log`, que não devem ser alterados. Root não tem scripts; `server/client npm test` falham intencionalmente com “no test specified”. Baseline de sintaxe documental passou para os arquivos especificados.
