# Estrutura da aplicação AutoPart-SyncDistributed

## 1. Apresentação

O AutoPart-SyncDistributed é um protótipo de aplicação de negócios eletrônicos voltado à consulta de autopeças, ao controle de estoque e ao registro de pedidos simulados. Este documento descreve a organização técnica do sistema e sua relação com o processo de compra representado na aplicação. O escopo compreende a execução local para fins acadêmicos; não inclui processamento financeiro, entrega de mercadorias ou operação comercial em ambiente público.

## 2. Processo de negócios representado

A interação começa no catálogo público, no qual o cliente consulta peças e seus detalhes. O carrinho organiza os itens selecionados na interface, enquanto o registro do pedido exige autenticação. Ao receber a solicitação de checkout, o servidor consulta os produtos, verifica a disponibilidade de estoque, calcula os valores e grava o pedido. O cliente pode consultar o próprio histórico; usuários com perfil administrativo dispõem de rotas para gestão de produtos e pedidos.

O pedido registrado representa uma etapa de solicitação no protótipo, não uma venda concluída. O estado do pedido pode ser acompanhado nas funções administrativas, mas não há integração com meios de pagamento, faturamento ou serviços de transporte. Essa delimitação é necessária para interpretar corretamente o fluxo de negócios eletrônicos demonstrado.

## 3. Organização técnica e framework

A interface foi desenvolvida em HTML, CSS e JavaScript. O servidor utiliza Node.js com Express 5 para receber requisições HTTP, aplicar middlewares, encaminhar rotas e devolver respostas JSON. A persistência é realizada no MongoDB por meio do Mongoose. O Express também disponibiliza os arquivos estáticos da interface, de modo que a separação entre cliente e API é lógica, embora ambos sejam entregues pelo mesmo processo servidor.

```text
Navegador: interface e carrinho
        │ requisições HTTP
        ▼
Servidor Node.js / Express
        ├── Rotas e middlewares: entrada e autorização
        ├── Controllers: validação e operações da aplicação
        └── Models / Mongoose: acesso a dados
                         │
                         ▼
                     MongoDB local
```

O ponto de entrada `server/index.js` estabelece a conexão com o banco antes de iniciar o servidor HTTP. Em `server/src/app.js`, o Express configura o tratamento de JSON, as rotas da API e a entrega da interface. Os módulos em `server/src/routes/` definem os caminhos e associam as operações aos controllers; `server/src/models/` contém os modelos de dados. A interface consome a API por intermédio de `client/js/api.js` e `client/js/app.js`.

Essa organização permite identificar as responsabilidades de apresentação, processamento e persistência. O nome do projeto não implica, por si, distribuição entre máquinas: a configuração documentada utiliza um servidor de aplicação e um serviço MongoDB em ambiente local, sem balanceamento ou tolerância automática a falhas.

## 4. Dados, pedido e controle de acesso

Os dados incluem usuários, peças, categorias, fornecedores, movimentações e pedidos. No checkout, `server/src/controllers/OrdersController.js` recebe identificadores de peças e quantidades; preço e estoque são obtidos no servidor. O pedido conserva um registro dos dados das peças e do preço unitário no momento da operação. O cálculo do total, a criação do pedido e a redução do estoque são executados em uma transação MongoDB. A atualização de cada peça também exige estoque suficiente, impedindo que o valor informado pelo cliente seja tomado como fonte de preço ou disponibilidade.

O `compose.yaml` configura o MongoDB local como replica set de membro único para possibilitar transações. Isso oferece a condição técnica necessária ao fluxo transacional descrito, mas não caracteriza replicação entre servidores distintos nem alta disponibilidade.

As rotas de autenticação ficam em `/api/auth`; as de pedidos, em `/api/orders`; e as de administração, em `/api/admin`. O middleware de autorização verifica o token e o perfil nas rotas protegidas. A consulta ao detalhe de um pedido pelo cliente considera o identificador do usuário autenticado. Esses mecanismos descrevem controles implementados no protótipo, sem equivaler a uma avaliação completa de segurança para produção.

## 5. Demonstração e verificação

As instruções de instalação, configuração e testes constam no [README](../README.md). Na execução local padrão, a interface está disponível em `http://127.0.0.1:3000`, e os slides em `/apresentacao`. O endpoint `GET /api/ping` confirma a resposta do processo HTTP; ele não verifica a disponibilidade do banco de dados.

Uma demonstração do fluxo pode apresentar a consulta ao catálogo, a autenticação, o registro de um pedido simulado, a consulta ao histórico e as operações administrativas. Os testes automatizados utilizam uma instância de MongoDB separada da demonstração. Os resultados de execuções anteriores não dispensam nova verificação no ambiente utilizado para a apresentação.

## 6. Delimitações

O sistema demonstra funcionalidades de catálogo, estoque e pedidos no contexto da disciplina de Negócios Eletrônicos. Não são objeto desta implementação a confirmação de pagamento, a expedição, a entrega, a integração com fornecedores externos ou a implantação pública. Também não se afirma operação em múltiplos nós, disponibilidade contínua ou conformidade de segurança para uso comercial. A análise apresentada limita-se ao comportamento documentado no código e aos testes locais.

## Documentos relacionados

- [README: execução, configuração e testes](../README.md)
- [Relatório do projeto](../RELATORIO_PROJETO.md)
- [Apresentação HTML](apresentacao.html)
- [Apresentação PDF em português (offline)](apresentacao.pdf)
- [Roteiro dos 12 slides em português e árabe](presentation-script.ar-pt.md)
- [شرح المشروع بالعربية / Explicação em árabe](EXPLICACAO-AR.md)
