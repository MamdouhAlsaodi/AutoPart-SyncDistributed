# Dados grandes de demonstração (ambiente local)

Esta base é **fictícia**: peças, marcas, compatibilidades, fornecedores e pedidos não representam transações ou especificações reais. Não a exponha à internet nem a use como catálogo comercial.

## Ambiente local de demonstração

- Execute o MongoDB em loopback (`127.0.0.1:27017`) como replica set de membro único para as transações e inicie o aplicativo localmente. Consulte o README para a alternativa com Docker Compose. O catálogo e os slides ficam em `http://127.0.0.1:3000/` e `/apresentacao` quando configurados nessa porta.
- A configuração `.env` é local, ignorada pelo Git e com permissões restritas. Contém segredo JWT e senha de demonstração **gerados localmente**. Não publique, copie para um repositório ou envie pelo chat.
- As contas fictícias são `admin.demo@autopart.test` e `cliente.demo@autopart.test`. Na criação inicial, a senha era o valor de `SEED_DEMO_PASSWORD`. **Após uma troca de senha no banco, esse valor em `.env` não representa mais a senha ativa**; o seed não sobrescreve credenciais existentes. A senha temporária de apresentação deve ser trocada por uma forte antes de qualquer uso fora da demo privada.
- `server/tailnet-proxy.js` é uma ponte opcional que vincula à interface Tailscale local, sem publicar a porta em uma rede comum. Não confunda acesso privado com serviço público; verifique endereço e autorização em cada máquina antes de habilitar a ponte. Não há URL privada ou serviço systemd persistente fornecido pelo repositório. Após trocar de sistema, confirme separadamente banco, configuração, serviços e conectividade; não suponha que tenham sido transferidos.

## Carga reproduzível

`server/seed-large.js` insere **até 600 peças**, **12 categorias**, **12 fornecedores**, **120 pedidos históricos** e duas contas fictícias. Usa códigos `DEMO-0001` a `DEMO-0600`, e identificadores determinísticos dos pedidos. Todas as escritas usam `$setOnInsert` ou upsert com esses identificadores: rodar novamente não duplica nem sobrescreve registros existentes, senhas, edições ou estoque reduzido por pedidos de teste. Pedidos novos feitos pelo checkout são conservados; por isso o total pode superar 120.

Na **raiz do repositório**, com MongoDB já iniciado:

```bash
npm ci --prefix server
# Configure .env privado: MONGODB_URI=mongodb://127.0.0.1:27017/autopart_sync,
# SEED_DEMO_PASSWORD com 12+ caracteres, e JWT_SECRET independente com 32+ caracteres.
node server/seed-large.js
node --test server/tests/large-demo-seed.test.js client/tests/*.test.js
```

O script **recusa** URIs diferentes de `mongodb://127.0.0.1:27017/autopart_sync`; não roda contra banco remoto nem o banco dos testes. Não execute o `server/seed.js` antigo para ampliar os dados sem antes analisar suas alterações: é outro seed, ligado à configuração `SEED_DEMO_DATA`. Para esta carga grande, mantenha `SEED_DEMO_DATA=false` e execute `server/seed-large.js` explicitamente. O README principal descreve a alternativa com Docker Compose para instalar o MongoDB em outra máquina.

**Antes de reinstalar o sistema:** salve o repositório/branch local, o arquivo `.env` de forma privada e o banco em `~/.local/share/autopart-mongodb/db` após parar os dois serviços. O commit local não é um backup remoto e os dados não são versionados. Nunca copie o diretório WiredTiger enquanto o `mongod` escreve nele; pare o serviço ou use `mongodump` com uma instalação apropriada.

## Movimentações e relatórios da demonstração

Na área de gestão (`admin`/`operador`), **Movimentações** permite registrar entrada e saída manual de estoque; cada operação usa uma transação MongoDB e o usuário autenticado, com quantidade inteira positiva e impedimento de saída acima do estoque. Clientes não têm acesso ao histórico global. Novos pedidos simulados também registram saídas de estoque na mesma transação do checkout. **Os 120 pedidos históricos gerados antes dessa melhoria não têm movimentações retroativas**: não se inventou um log para operações que não foram executadas.

**Relatórios** mostra peças ativas, unidades, estoque baixo/zerado, valor estimado do estoque ao preço de catálogo, resumo das **últimas 100** movimentações e, para administrador, contagem de pedidos simulados. Valor do estoque não significa receita nem venda realizada; nenhum pagamento acontece neste protótipo. O cliente dispõe de botão **Voltar ao catálogo** em *Meus pedidos*.

## Central de operações e apresentação

A conta `admin` entra na **Central de operações**, que permanece acessível no primeiro item do menu lateral; `Visão geral` é um resumo de navegação, enquanto `Peças e catálogo` mantém o fluxo operacional de peças/categorias. A Central reúne produtos e pedidos sem substituir essas páginas: indicadores, pesquisa por código/nome, filtro de inativos, 12 produtos por página, 8 pedidos por página, formulário de novo produto sob demanda, detalhes, edição de preço/estoque e desativação confirmada. Os status de pedidos oferecem só as transições permitidas pela API. Os números e ações são da demo acadêmica, sem pagamentos reais. A interface recupera os dados existentes; mudar a página não reexecuta o seed nem apaga registros.

A primeira página de `/apresentacao` e `docs/apresentacao.pdf` mostra o **Diagrama de Arquitetura de Software**: navegador (HTML/CSS/JS e carrinho local), API Express (JWT, papéis, validação de preço/estoque e transações) e MongoDB local via Mongoose. Ícones e setas representam conexões lógicas; os blocos inferiores são mecanismos internos, não outros servidores. O botão **Notas (عربي)** contém o roteiro detalhado em árabe para explicar o diagrama. O desenho vetorial editável está em `docs/architecture-diagram.svg` e também incorporado ao HTML para funcionar sem ativos externos.

## ملخص بالعربية

قاعدة العرض محلية وتجريبية بالكامل: 600 قطعة و12 تصنيفًا و12 مورّدًا و120 طلبًا اصطناعيًا كبداية. افتح `http://127.0.0.1:3000/` والعرض على `/apresentacao`. صار في *طلباتي* للعميل زر يرجعه للكتالوج؛ قسم **Movimentações** وتقرير المخزون في لوحة الإدارة/الموظفين، وليس للعميل، والطلبات الجديدة تسجل خروج القطع من المخزون. الطلبات القديمة الاصطناعية لا تملك سجل حركات قديمًا. تشغيل `node server/seed-large.js` مرة أخرى لا يمسح تعديلاتك ولا يكرر بياناته؛ أي طلب تنشئه بنفسك سيبقى. **بعد تغيير كلمة سر الحسابين، لم تعد قيمة `SEED_DEMO_PASSWORD` في `.env` كلمة الدخول الحالية**؛ هي فقط قيمة التهيئة الأولى، والـseed لا يبدّل الحسابات القائمة. عند تغيير القرص، انسخ المشروع وملف الإعدادات سرًّا والقاعدة بعد إيقاف الخدمة؛ الخدمات الحالية مؤقتة على هذا النظام.
