# PDR/PRD — AutoPart-SyncDistributed

## 1. Visão e objetivo
O produto é um protótipo acadêmico de comércio eletrônico para venda de peças automotivas. O cliente pesquisa peças, verifica compatibilidade e estoque, monta um carrinho, cria conta, simula uma compra e acompanha pedidos. O administrador mantém produtos, estoque e status de pedidos.

A base existente é um sistema de inventário com autenticação, usuários, peças e movimentações. Ela será preservada e ampliada; não constitui, por si só, prova de catálogo público, cliente, carrinho, checkout ou pedidos.

## 2. Usuários e limites
- **Cliente:** navega no storefront, pesquisa, consulta detalhes, registra-se, autentica-se, compra e vê apenas seus pedidos.
- **Administrador:** acesso separado e autorizado para CRUD de produtos, preço/estoque e gestão de pedidos.
- **Fora do escopo:** pagamento real, transportadora/e-mail, marketplace, app nativo e migração para JSON.

## 3. Arquitetura e tecnologias
Front-end e back-end permanecem separados. O servidor Node.js/Express aplica regras de negócio e expõe APIs; o cliente Vanilla JS/HTML/CSS consome-as. MongoDB/Mongoose são a direção de persistência durável, com JWT para autenticação e bcryptjs para senhas. O navegador pode manter somente o carrinho de uso; preço, estoque, usuário e pedido são autoridade do servidor. Tailwind CSS existente pode apoiar a UI, sem substituir os limites de API.

## 4. Dados e invariantes duráveis
Direção de entidades: `User` (cliente/admin e perfil), `Part` (código, nome, categoria, marca, modelos/anos compatíveis, descrição, preço, estoque, imagem/referência, ativo), `Order` (cliente, itens com snapshots de código/nome/preço, quantidades, total, data e status). Relações usam IDs; pedidos preservam o preço histórico.

Invariantes: senha nunca é retornada; JWT e autorização distinguem cliente/admin; o servidor valida entrada, usuário, preço e estoque; total é recalculado no servidor; estoque não pode ficar negativo; pedido e baixa de estoque devem ser consistentes/atômicos conforme o mecanismo adotado; cliente não lê pedidos alheios; admin controla somente rotas autorizadas.

## 5. Estado observado da base
- `server/src/app.js` é a aplicação Express; existem controllers/routes/models de auth, usuários, peças e movimentações.
- O cliente Vanilla JS está em `client/index.html`, `client/js/api.js` e `client/js/app.js`.
- Não há modelo nem rotas de `Order`; `Part` ainda não possui compatibilidade veicular/imagem; `User.perfil` hoje é admin/operador/consulta.
- Rotas atuais de peças exigem autenticação. Esses fatos são baseline, não aceitação futura.

## 6. Matriz de rastreabilidade acadêmica
| Checklist | Fase(s) | Aceitação observável | Evidência planejada |
|---|---:|---|---|
| Identidade | 2,6 | Home identifica a loja e separa cliente/servidor | screenshot + relatório |
| Home/navegação | 2,6 | Header, footer, categorias, destaques e links funcionam | screenshots + teste navegador |
| Catálogo/detalhes | 1–2,6 | Cards e detalhe mostram nome, preço, descrição, compatibilidade e estoque | screenshot + teste API/UI |
| Busca/filtros | 2,6 | Nome/marca/modelo/categoria consultam backend | requests/resultado + screenshot |
| Carrinho | 3,6 | Adicionar/remover/quantidade/subtotais/total corretos e preservados | teste navegador + screenshot |
| Clientes | 3,6 | Cadastro validado, persistido, login real e senha ausente da resposta | teste API + screenshot |
| Compra/histórico | 4,6 | Checkout simulado persiste e histórico mostra status do próprio cliente | teste MongoDB + screenshots |
| Produtos/estoque | 1,2,4–5,6 | Produto tem campos exigidos e estoque é autoridade do backend | testes API/modelo + screenshot admin |
| Usuários/pedidos | 1,3–5,6 | Pedido guarda itens, quantidades, total, data/status e cliente | teste MongoDB |
| Administração | 5,6 | Admin lista/cadastra/edita/exclui produtos e altera pedidos | screenshots + testes de autorização |
| Integração | 2–5,6 | Loja e admin usam APIs e mesma base; alterações refletem | fluxo ponta a ponta |
| MongoDB | 1,4,6 | Dados persistem em MongoDB real, sem hard-code comercial | log/config + consulta pós-restart |
| UX responsiva | 2–3,6 | Layout utilizável em desktop/mobile | screenshots viewport |
| Testes de aceitação | 2–6 | Fluxos checklist passam em API e navegador | matriz de testes/relatório |
| Entrega acadêmica | 6 | README, relatório, execução e referências disponíveis | arquivos entregáveis |
| Evidência visual | 6 | Telas principais capturadas sem segredos | diretório de screenshots |
| Prova 1: peças/filtros | 2,6 | Catálogo filtra e exibe peças | screenshot + teste |
| Prova 2: pesquisa | 2,6 | Pesquisa por nome/modelo/categoria retorna backend | screenshot + request |
| Prova 3: carrinho | 3,6 | Carrinho calcula e altera itens | screenshot + teste |
| Prova 4: cadastro/login | 3,6 | Cliente registra e autentica | screenshot + teste |
| Prova 5: admin | 5,6 | Admin gerencia produtos e pedidos | screenshots + teste 403 |
| Prova 6: finalização | 4,6 | Checkout cria pedido e aplica estoque seguro | recibo + consulta MongoDB |

## 7. Critério de produto
Nenhuma capacidade ausente será considerada entregue apenas por existir uma rota ou tela: o aceite exige fluxo integrado, persistência quando aplicável, autorização e evidência correspondente na Fase 6.
