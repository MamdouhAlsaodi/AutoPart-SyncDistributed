# Framework utilizado — AutoPart-SyncDistributed

Documento técnico para apresentação acadêmica. Descreve **a implementação presente no repositório**, não uma proposta de migração. O relatório inicial mencionava Slim Framework (PHP) e Microsoft SQL Server; essas tecnologias **não aparecem na aplicação atual**. O backend foi desenvolvido em **Express 5 sobre Node.js**, com **MongoDB/Mongoose** como persistência.

## 1. Objetivo e recorte

O protótipo atende a um catálogo de autopeças com pesquisa, autenticação, inventário, pedidos simulados e uma área administrativa. O cliente em JavaScript usa uma API HTTP/JSON; não acessa o banco diretamente. A separação é **lógica entre cliente, servidor e banco**: o Express também serve os arquivos estáticos do cliente. O MongoDB local roda como serviço separado. A execução documentada é local, sem afirmação de hospedagem pública, múltiplos nós ou tolerância automática a falhas.

## 2. Por que Express

Express fornece composição de rotas e middlewares HTTP sem impor uma estrutura completa de aplicação. Neste projeto, `server/src/app.js` centraliza o roteamento e a serialização JSON, enquanto diretórios distintos guardam routes, controllers, models e middleware. Isso permite explicar cada responsabilidade de forma verificável e exercitar as rotas em testes. A escolha de Express não torna, por si só, a aplicação distribuída: a comunicação cliente/API por rede e a persistência em um serviço separado são os limites de componentes que podem ser observados aqui.

## 3. Componentes e percurso de uma requisição

```text
Navegador (client/)
    │ HTTP / JSON
    ▼
Express (server/index.js → server/src/app.js)
    ├─ routes/ + middleware/auth.js
    ├─ controllers/ (validação e regras de negócio)
    └─ models/ + config/db.js ── Mongoose ──► MongoDB local
```

- `server/index.js` conecta ao MongoDB antes de aceitar requisições; o seed de demonstração só roda quando `SEED_DEMO_DATA=true`.
- `server/src/app.js` monta `/api/auth`, `/api/orders`, `/api/admin`, `/api/catalogo`, rotas de peças e movimentações; entrega também `client/` e `docs/apresentacao.html` em `/apresentacao`.
- `server/src/routes/catalogueRoutes.js` expõe lista e detalhe públicos; `orderRoutes.js` exige perfil cliente; `adminRoutes.js` exige perfil administrador.
- `server/src/controllers/` processa requisições e responde JSON; `server/src/models/` define entidades persistidas por Mongoose.
- `client/js/api.js` e `client/js/app.js` integram a interface às APIs. O carrinho pode residir no navegador durante o uso, mas preço e estoque são validados no servidor no checkout.

## 4. Persistência, consistência e autorização

Os modelos atuais incluem usuários, peças, pedidos, movimentações, categorias e fornecedores. `server/src/controllers/OrdersController.js` busca as peças, registra snapshots de nome/código/preço no pedido, calcula o total do lado do servidor e atualiza o estoque com condição de disponibilidade dentro de `session.withTransaction`. O `compose.yaml` inicia MongoDB 7 com replica set **de membro único**, necessário para essa transação. Trata-se de atomicidade local; não há evidência de cluster replicado entre máquinas, failover automático ou consistência entre serviços remotos.

`server/src/middleware/auth.js` controla o token e perfis nas rotas protegidas. O cliente não pode ler pedidos de terceiros pela rota de detalhe, que consulta o `customerId` autenticado. A área de administração é separada por perfil. Essas são propriedades do código atual, não uma declaração de auditoria de segurança para produção.

## 5. Demonstração e verificações

Reproduza o ambiente conforme o [README](../README.md): Node/npm, Docker Compose, MongoDB local e `.env` privado. No padrão documentado, use `http://127.0.0.1:3000` para interface e `/apresentacao` para slides. `GET /api/ping` mostra que o processo responde, mas não verifica a conexão ao banco. Para testes com persistência, inicie `mongodb-test` isolado em 27018 e rode os comandos do README; não reutilize dados da demo. A [avaliação de prontidão anterior](READINESS-ASSESSMENT-2026-09-16.md) registra resultados históricos e precisa de revalidação no dia da apresentação.

Um roteiro didático possível: abrir a vitrine e buscar peças; autenticar o cliente; criar um pedido simulado e conferir seu histórico; abrir a administração e observar que um cliente não tem permissão para suas rotas. Nenhum desses passos representa pagamento, entrega ou disponibilidade pública.

## 6. Limites e evolução possível

- O repositório entrega um **protótipo local**, não infraestrutura distribuída de alta disponibilidade. Adicionar réplicas, balanceamento e monitoramento seria trabalho futuro, não recurso comprovado.
- O MongoDB de membro único é usado para a demo e transações; não elimina um ponto único de falha.
- A separação por API permite a construção de outros clientes no futuro, mas não há app móvel ou microsserviços implementados neste repositório.
- A API, autenticação e apresentação devem ser testadas novamente antes da entrega ao professor; esta documentação não substitui uma execução real.

## Referências internas

- [README e comandos de execução](../README.md)
- [Relatório acadêmico do projeto](../RELATORIO_PROJETO.md)
- [Plano e requisitos originais](../PDR.md)
- [Slides da apresentação](apresentacao.html)
