# Relatório do Projeto — Fase 6A

## 1. Objetivo

O projeto AutoPart-SyncDistributed organiza uma aplicação local para consulta de catálogo, gestão de peças e estoque, autenticação de clientes e administração de pedidos simulados. Este relatório registra a entrega documental e técnica desta fase sem afirmar publicação, operação comercial ou aceitação final.

## 2. Arquitetura front-end e back-end

O back-end é um servidor Node.js com Express localizado em `server/`. O front-end é uma aplicação estática em HTML, CSS e Vanilla JavaScript, servida pelo servidor a partir de `server/src/app.js`. O navegador mantém o estado de uso do carrinho em `localStorage`; o servidor permanece responsável por preço, estoque e autoridade do pedido.

A separação é exercida por APIs HTTP: o catálogo público usa `/api/catalogo`; o cliente usa `/api/auth/register`, `/api/auth/login`, `/api/orders/checkout`, `/api/orders/me` e `/api/orders/:id`; a administração usa o prefixo protegido `/api/admin`.

## 3. Tecnologias e banco de dados

São utilizados Node.js, Express, MongoDB, Mongoose, JWT e bcryptjs, conforme a implementação existente. O `compose.yaml` oferece os serviços locais de membro único `mongodb` em loopback na porta 27017 e `mongodb-test` em loopback na porta 27018. A configuração de runtime requer `MONGODB_URI`, `JWT_SECRET` e `PORT`. A carga de demonstração é opcional, desativada por padrão, e requer `SEED_DEMO_PASSWORD` quando deliberadamente habilitada.

## 4. Fluxos funcionais

- **Página inicial e navegação:** o cliente apresenta a vitrine, navegação para catálogo, carrinho, conta e área administrativa conforme o perfil autenticado.
- **Catálogo, filtro e detalhe:** a vitrine consulta o catálogo público, permite busca por texto e filtros de marca, modelo e categoria, e apresenta o detalhe do produto e suas compatibilidades.
- **Carrinho:** itens são mantidos no armazenamento local do navegador para uso da interface. O conteúdo enviado ao checkout é validado novamente no servidor.
- **Cliente, cadastro e login:** o cadastro usa `/api/auth/register`; o login usa `/api/auth/login` e recebe um JWT. A senha não é devolvida nas respostas de usuário.
- **Checkout e histórico:** o cliente autenticado envia o carrinho a `/api/orders/checkout` e consulta seus pedidos em `/api/orders/me` e `/api/orders/:id`. O checkout é simulado.
- **Administração:** a área administrativa protegida pelo prefixo `/api/admin` consulta e gerencia produtos e pedidos segundo as regras de autorização existentes.
- **Produto e estoque:** o back-end mantém os dados de produto e o estoque; a interface administrativa expõe os fluxos existentes de consulta e manutenção.

Não há pagamento, entrega, logística ou integração externa de comércio neste escopo.

## 5. Evidências de testes e resultados

A matriz em `docs/evidence/MATRIZ_EVIDENCIAS.md` relaciona cada item do checklist a arquivos, APIs e testes. O teste de F6 (`node --test tests/fase6-seed.test.js`) usa stubs em processo, verifica os e-mails/perfis demo exatos, compara a senha com bcrypt e bloqueia métodos destrutivos. Os runners de F1, F2, F4 e F5 iniciam e interrompem somente o serviço `mongodb-test` em loopback local, como comportamento de limpeza autocontida. O teste de cliente da Fase 3 é `node --test ../client/tests/fase3-client.test.js` executado a partir de `server/`.

Foram fornecidos os seguintes resultados funcionais, todos com saída 0 e executados a partir de `server/` após o reparo R1:

- `npm run test:fase1`: integração Node do servidor — 4 passaram, 0 falharam.
- `npm run test:fase2`: teste de API — 1 passou, 0 falhou; teste estático do cliente — 1 passou, 0 falhou.
- `node --test ../client/tests/fase3-client.test.js`: 4 passaram, 0 falharam.
- `npm run test:fase4`: integração do servidor — 3 passaram, 0 falharam; contrato do cliente — 3 passaram, 0 falharam.
- `npm run test:fase5`: integração do servidor — 3 passaram, 0 falharam; testes do cliente — 2 passaram, 0 falharam. A integração do servidor emitiu aviso de descontinuação do Mongoose sobre a opção `new` em `findOneAndUpdate`/`findOneAndReplace`; o comando permaneceu com saída 0.

Não há runtime público, URL pública ou screenshots nesta fase; não se afirma aceitação visual ou aceitação final.

## Aspectos Jurídicos, Institucionais e Sustentabilidade

Esta seção constitui discussão técnica e acadêmica, não aconselhamento jurídico. A adequação jurídica de uma implantação real depende do contexto, das finalidades, dos contratos e de avaliação profissional competente.

A aplicação deve observar princípios de minimização de dados, finalidade, necessidade, transparência e segurança associados à LGPD. O fluxo de cliente deve coletar apenas dados necessários ao cadastro e ao pedido, com retenção e acesso definidos pela instituição responsável. Dados de teste devem permanecer genéricos e não representar pessoas reais.

As senhas devem ser armazenadas por hash, e não retornadas nas respostas. O código usa bcryptjs para o hash e exige `JWT_SECRET` configurado, não permitindo uma chave padrão no código. O segredo deve ser longo, exclusivo, privado e fornecido pela configuração de execução. JWT não substitui políticas de expiração, revogação, proteção de sessão e governança de acesso.

As funções de acesso são separadas por papéis, incluindo cliente e perfis administrativos existentes. A autorização deve ser verificada no servidor, e não apenas ocultada na interface. A rastreabilidade depende de registros de pedidos, movimentos, testes e histórico de alterações mantidos com responsabilidade pelo repositório e pela instituição que o reutilizar.

A responsabilidade institucional inclui revisar dependências, controlar segredos, validar requisitos, conservar evidências verificáveis, testar em ambiente autorizado e não apresentar telas, dados ou resultados não capturados. A execução local reduz dependência de infraestrutura pública durante desenvolvimento e facilita a reutilização da base de inventário por trabalhos futuros, desde que sejam feitas novas avaliações de segurança, privacidade e operação.

A sustentabilidade técnica favorece implantação local controlada, uso do banco de testes temporário e reaproveitamento da fundação de inventário. Isso não constitui alegação de eficiência energética nem substitui medições. O projeto não afirma oferecer pagamento, entrega, logística ou comércio externo.

## 7. Limitações e conclusão

A entrega cobre documentação, evidências rastreáveis, remoção de dados privados do conjunto indicado, configuração obrigatória de JWT, seed opt-in não destrutivo e remoção do auto-seed do navegador. Não inicia runtime público, não cria URL pública, não captura screenshots e não representa aceitação final. A reutilização deve ocorrer após revisão independente e execução autorizada dos testes aplicáveis.

## 8. Referências

1. Node.js. **Documentation**. https://nodejs.org/docs/latest/api/
2. Express.js. **Express — documentação oficial**. https://expressjs.com/
3. MongoDB. **MongoDB Documentation**. https://www.mongodb.com/docs/
4. Mongoose. **Mongoose Documentation**. https://mongoosejs.com/docs/
5. OWASP. **Password Storage Cheat Sheet**. https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
6. Brasil. **Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais**. https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm

## 6A. Demonstração acadêmica local opt-in

O seed de demonstração é não destrutivo, idempotente e permanece desativado por padrão; sua execução depende de `SEED_DEMO_DATA=true` no runtime local e de `SEED_DEMO_PASSWORD` com pelo menos 12 caracteres. Para a demonstração acadêmica, os dois acessos públicos e genéricos são `admin.demo@autopart.test` (perfil `admin`) e `cliente.demo@autopart.test` (perfil `cliente`), ambos com `AutoPartDemo2026!`. Essas credenciais concedem acesso **somente à demonstração acadêmica semeada localmente**.

`AutoPartDemo2026!` é uma senha pública/ acadêmica para esse uso local, não é segredo JWT e não deve ser usada em produção. `JWT_SECRET` continua obrigatório, privado, gerado independentemente e distinto da senha da demonstração. Este registro não afirma execução do seed, runtime público, serviço público, produção, pagamento ou logística.

## Instruções de demonstração local

A demonstração acadêmica é somente local/demo. Com o projeto na raiz, execute:

```bash
docker compose up -d mongodb
cp .env.example .env
# Edite .env e use um JWT_SECRET privado com pelo menos 32 caracteres.
# Defina também SEED_DEMO_DATA=true e SEED_DEMO_PASSWORD=AutoPartDemo2026!
node server/index.js
```

Abra `http://localhost:3000`. As contas genéricas são `admin.demo@autopart.test` (admin) e `cliente.demo@autopart.test` (cliente), ambas com `AutoPartDemo2026!`. Essas credenciais são exclusivamente locais/demo acadêmicas; não há URL pública.
