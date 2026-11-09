# AutoPart-SyncDistributed — Roteiro de apresentação oral (Árabe falado + Português do Brasil)

> **Escopo honesto deste projeto (repita isso na apresentação):** protótipo acadêmico **local** de e-commerce de peças automotivas, com **dados sintéticos de demonstração**. O checkout é **simulado** — não existe pagamento real, entrega ou logística. O **Express serve o frontend e a API** a partir de um único processo Node.js, e o **MongoDB é um replica set de um único membro (`rs0`)** apenas para habilitar transações — isso **não** é alta disponibilidade nem sistema distribuído em múltiplos servidores. Os **22 testes** são da rodada verificada em **16/09/2026**, não resultados atuais.

## Como usar este roteiro (sequência prática)

1. **Antes de entrar na sala:** subir MongoDB (`docker compose up -d mongodb`), preparar `.env` local a partir de `.env.example` (com `JWT_SECRET` privado; preparar os dados demo conforme a documentação, sem expor a senha), iniciar `node server/index.js`, abrir `http://localhost:3000` (ou a porta configurada em `PORT`, ex.: 5500). Fazer o checklist: catálogo 200 → pedido de cliente → produtos e pedidos do admin → **403** do cliente em `/api/admin`. Nunca mostrar o valor de `JWT_SECRET` na tela.
2. **Ritmo sugerido (~10–12 min):** slides 1–4 arquitetura e problema (~4 min), slides 5–8 fluxo e segurança (~3 min), slide 9 evidências com a data (1 min), slide 10 limites (1 min, não pule — é o que passa credibilidade), slide 11 demo ao vivo (2 min), slide 12 encerramento (30 s).
3. **Transições prontas em português:** "Com o contexto claro, vamos ver quem usa o sistema." / "E como esse pedido atravessa as três camadas?" / "Isso nos leva à pergunta de segurança: o que impede um cliente de virar admin?" / "Falando de qualidade, temos evidências datadas." / "Agora, com honestidade, o que este protótipo NÃO faz." / "Vamos ao que funciona de verdade, ao vivo."
4. **Demo ao vivo (opcional, grounded em `client/js/app.js`):** vitrine com busca por nome/marca/modelo/categoria → modal de detalhe da peça com compatibilidade → adicionar ao carrinho → login como cliente → checkout simulado (o carrinho mostra uma estimativa; o servidor calcula o total do pedido) → "Meus pedidos" → login como admin → **Central de operações** (novo produto, busca, editar, desativar, pedidos com transições de status) → Movimentações (entrada/saída com motivo) → Relatórios (indicadores de estoque). Se algo falhar, mostre os slides 9–10 e siga.

---

## Slide 1 — Diagrama de Arquitetura de Software (slide de abertura)

### Arabic — العربية (شرح كامل)
الشريحة الأولى هي مخطط البنية، أبدأ من اليسار: الواجهة في المتصفح مبنية بـHTML وCSS وVanilla JavaScript، تعرض الكتالوج ومنطقة الإدارة، والسلة تُحفظ مؤقتًا في localStorage. السهم الأول يمثل طلبات HTTP وJSON عبر fetch إلى API مبنية على Node.js وExpress، وهي التي تتحقق من JWT وتفحص صلاحية الدور، ثم تعيد حساب السعر والتأكد من المخزون وتبني الطلب مع حركة خروج داخل معاملة. السهم الثاني هو وصول Mongoose إلى MongoDB المحلي الذي يحفظ القطع والمستخدمين والطلبات وحركات المخزون. المربعات السفلية — السلة المحلية، والأمان والقواعد، والتخزين المحلي — ليست خدمات أو أجهزة مستقلة بل تفاصيل داخل هذه الطبقات نفسها. وأنبّه بوضوح: rs0 هنا عضو واحد فقط لتمكين المعاملات، ولا يعني توفرًا عاليًا ولا نظامًا موزعًا على خوادم متعددة، ولا يوجد دفع حقيقي.

### Português — Português do Brasil
"Abro direto pela arquitetura, lendo o diagrama da esquerda para a direita. À esquerda, o navegador: HTML, CSS e Vanilla JS, com o catálogo e a área de gestão; o carrinho fica temporariamente no localStorage. O primeiro fluxo é HTTP com JSON via fetch até a API em Node.js e Express, que valida o JWT, confere a permissão do perfil, recalcula o preço e o estoque no servidor e cria o pedido com a movimentação dentro de uma transação. O segundo fluxo é o acesso do Mongoose ao MongoDB local, que guarda peças, usuários, pedidos e movimentações. Os blocos de baixo não são servidores separados — são mecanismos internos dessas mesmas camadas. E um aviso importante: o replica set `rs0` tem **um único membro**, só para transações funcionarem; isso não é alta disponibilidade nem sistema distribuído."

---

## Slide 2 — Problema e valor proposto

### Arabic — العربية (شرح كامل)
تبدأ القصة من مشكلة واقعية في الورشة: المخزون يُدار يدويًا بدفتر، فتتراكم الأخطاء في العدّ، والأسعار تتضارب، وقد يصعب تتبع الطلبات بشكل موثوق. قيمة المشروع المقترحة هي معالجة هذا بالأتمتة: كتالوج رقمي بالبحث والفلاتر، وسلة وطلبات محفوظة فعليًا في قاعدة البيانات، ومخزون مركزي على الخادم كمصدر وحيد للحقيقة. وأؤكد أن هذه النسخة تعمل في بيئة عرض محلية، فهو نموذج أولي للعرض الأكاديمي وليس عملية تجارية حقيقية.

### Português — Português do Brasil
"A motivação vem de um problema comum que pode ocorrer em oficinas: estoque controlado à mão, com anotações lentas, erros de contagem, preço inconsistente e nenhum histórico confiável de pedidos. O valor que propomos é digitalizar isso: um catálogo com busca e filtros, carrinho e pedidos persistidos de verdade, e um estoque centralizado no servidor, que é a fonte única de verdade. Quero deixar claro desde já: tudo roda localmente, é um protótipo para demonstração acadêmica, sem operação comercial."

---

## Slide 3 — Usuários e papéis

### Arabic — العربية (شرح كامل)
النظام له دوران رئيسيان. العميل النهائي يستكشف الكتالوج ويبحث عن القطع المتوافقة مع سيارته، يبني سلته، ينهي الطلب — وهو إنهاء محاكى لا دفع فيه — ثم يتابع تاريخ طلباته. المشرف يسجّل القطع ويعدّلها بالسعر والمخزون، يتابع الطلبات ويحدّث حالاتها، وكل ذلك عبر API محمية بالدور. أما الحسابان التجريبيان فيُنشآن عند إعداد بيانات العرض المحلية، ولا أعرض كلمة السر على الشاشة.

### Português — Português do Brasil
"O sistema tem dois papéis principais. O cliente final explora o catálogo, busca peças compatíveis com o veículo, monta o carrinho, finaliza o pedido — com checkout simulado, sem pagamento real — e acompanha seu histórico depois. O administrador cadastra e edita peças, preço e estoque, acompanha os pedidos e atualiza os status, sempre através da API protegida por perfil. As contas demo, como `admin.demo@autopart.test` e `cliente.demo@autopart.test`, são criadas quando preparamos os dados de demonstração, e a senha é definida localmente — nunca a exibo na apresentação."

---

## Slide 4 — Navegador → API Express → MongoDB

### Arabic — العربية (شرح كامل)
هنا أشرح رحلة الطلب عبر الطبقات الثلاث. الطبقة الأولى هي المتصفح بـVanilla JS، يعرض البيانات ويحتفظ بالسلة في localStorage ويتواصل مع الـAPI عبر fetch، لكنه ليس مصدرًا موثوقًا للسعر أو المخزون. الطبقة الثانية هي API Express على Node.js: تقبل REST بـJSON، تتحقق من البيانات والسعر والمخزون، وتطبّق JWT والتفويض حسب الدور. الطبقة الثالثة هي MongoDB عبر Mongoose، يحفظ المنتجات والمستخدمين والطلبات فعليًا محليًا. الرسالة الجوهرية: الخادم هو السلطة — السعر والمخزون والطلب يُقررون ويُعاد التحقق منهم في الخلفية، ولا يعتمد على المتصفح وحده.

### Português — Português do Brasil
"Esta é a jornada de uma requisição nas três camadas. Na camada 1, o navegador em Vanilla JS só apresenta: carrinho no localStorage e consumo da API via fetch — mas ele não é a autoridade para preço e estoque. Na camada 2, a API Express em Node.js expõe REST em JSON, valida dados, preço e estoque, e aplica JWT com autorização por perfil. Na camada 3, o MongoDB via Mongoose persiste produtos, usuários e pedidos localmente. A frase-chave deste slide é: o servidor é a autoridade — preço, estoque e pedido são decididos e revalidados no back-end, nunca só no navegador. Se alguém alterar o preço nas ferramentas do navegador, o número não é aceito no checkout."

---

## Slide 5 — Vitrine, catálogo e busca

### Arabic — العربية (شرح كامل)
واجهة المتجر عامة ويمكن للزائر تصفحها دون تسجيل: الكتالوج يجلب من `GET /api/catalogo` بدون دخول. البحث يعمل بالاسم والماركة والموديل، مع فلاتر بالتصنيف. عند فتح بطاقة القطعة تظهر تفاصيلها: التوافق مع الماركة والموديل، السعر، والمخزون الظاهر. ومن نفس الواجهة ينتقل المستخدم إلى السلة والحساب، وبعد دخول المشرف إلى المنطقة الإدارية. هذا أول موضع محتمل للعرض الحي: أبحث عن قطعة وأعرض بطاقتها أمام الحضور.

### Português — Português do Brasil
"A vitrine é pública: o catálogo vem de `GET /api/catalogo` e pode ser consultado sem login. A busca funciona por nome, marca e modelo, com filtros por marca, modelo e categoria. Ao abrir a ficha da peça, vejo compatibilidade por marca e modelo, preço e estoque visível. Da mesma navegação o usuário chega ao carrinho, à conta e — logado como admin — à área administrativa. Este é o primeiro ponto natural de demo ao vivo: buscar uma peça e abrir a ficha."

---

## Slide 6 — Carrinho, checkout e histórico

### Arabic — العربية (شرح كامل)
رحلة الشراء أربع خطوات. أولًا السلة تبقى في المتصفح: العناصر والكميات في localStorage، وهي تقدير فقط. ثانيًا عند إنهاء الطلب يُرسل `POST /api/orders/checkout` بعد الدخول، والخادم يعيد التحقق من العناصر والأسعار والمخزون من قاعدة البيانات — وليس مما أرسله المتصفح. ثالثًا الطلب يُحفظ فعليًا في MongoDB بحالة خاصة به، مع حركة خروج من المخزون ضمن المعاملة. رابعًا العميل يعرض طلباته من `GET /api/orders/me` وتفصيل الطلب من `GET /api/orders/:id`. وأقولها صراحة: الطلب محاكاة فقط، ولا توجد عملية دفع حقيقية.

### Português — Português do Brasil
"O fluxo de compra tem quatro passos. Primeiro, o carrinho vive no navegador — itens e quantidades no localStorage, apenas uma estimativa. Segundo, no checkout autenticado, o `POST /api/orders/checkout` revalida itens, preços e estoque no servidor, buscando tudo da base, e o total confirmado é o total calculado pelo servidor. Terceiro, o pedido é gravado de fato no MongoDB com status próprio. Quarto, o cliente consulta seu histórico pelo `GET /api/orders/me` e os detalhes pelo `GET /api/orders/:id`. E repito com todas as letras: o checkout é simulado — não há pagamento real."

---

## Slide 7 — Administração e inventário

### Arabic — العربية (شرح كامل)
مسارات الإدارة الرئيسية تقع خلف `/api/admin` المحمي، أي أن الحماية على مستوى الـAPI نفسه وليست مجرد إخفاء زر في الواجهة. منها يُنشأ الاسم والسعر والمخزون ويُعدّل كل ذلك. الطلبات تُتابع وتتغير حالتها وفق انتقالات مسموحة مثل من «قيد الانتظار» إلى «مؤكد» أو «ملغى». في التطبيق تظهر «Central de operações» للمنتجات والطلبات في مكان واحد، بالإضافة إلى شاشات المخزون و«الحركات» لتسجيل إدخال قطع إلى المخزون أو إخراجها مع توضيح السبب، وتقارير ملخصة. كل الاستعلامات والصيانة مدعومة بالتحقق من الدور في الخادم.

### Português — Português do Brasil
"As rotas principais de administração ficam atrás do prefixo protegido `/api/admin` — a proteção está no nível da API, não é só esconder um botão na tela. Por ali se cria e edita peça: nome, compatibilidade, preço e estoque. Os pedidos são acompanhados e os status mudam por transições permitidas, por exemplo de 'pendente' para 'confirmado' ou 'cancelado'. No app isso aparece como a 'Central de operações', com produtos e pedidos num só lugar, além das telas de Movimentações — entradas e saídas com motivo — e Relatórios. Toda consulta e manutenção se apoia na autorização por perfil verificada no servidor."

---

## Slide 8 — Segurança e autorização

### Arabic — العربية (شرح كامل)
أشرح ثلاث آليات مطبقة في النموذج. أولًا كلمات المرور لا تُخزن نصًا أبدًا بل كتجزئة عبر bcryptjs، ولا يُفترض إعادتها إلى المتصفح. ثانيًا الجلسات عبارة عن JWT موقّع بمفتاح `JWT_SECRET` خاص وطويل يأتي من الإعداد المحلي ولا يُنسخ في المستودع ولا يظهر على الشاشة. ثالثًا الأهم: التفويض حسب الدور يُفحص في الخادم نفسه، لا مجرد إخفاء عناصر في الواجهة. الدليل العملي الذي تحققناه محليًا: عميل مسجَّل الدخول يتلقى الخطأ 403 عند محاولة الوصول إلى مسار إداري.

### Português — Português do Brasil
"Temos três camadas de segurança. Primeira: senhas com hash `bcryptjs` — nunca armazenadas nem devolvidas em texto puro. Segunda: sessões JWT assinadas, com um `JWT_SECRET` privado, longo, fornecido por configuração local e nunca versionado nem exibido. Terceira, e a mais importante: autorização por perfil verificada no servidor, não apenas escondida na interface. A prova prática que verificamos localmente: um cliente autenticado recebe **403** ao tentar acessar o endpoint administrativo. Isso mostra que a regra vive no back-end."

---

## Slide 9 — Evidências de teste e execução

### Arabic — العربية (شرح كامل)
هذه شريحة الأدلة، وأصرّ على ذكر التاريخ: النتائج موثّقة بمراجعة بتاريخ 16 سبتمبر 2026، أي أنها نتيجة لجولة محددة وليست ضمانًا لحالة اليوم. في تلك الجولة نجحت 22 اختبارًا آليًا عبر المراحل من الأولى إلى السادسة دون أي فشل. الفحوص التشغيلية المحلية غطت: الصفحة الرئيسية والكتالوج باستجابة 200، دخول المشرف والعميل بكلمة العرض المضبوطة، طلبات العميل المسجّل، منتجات وطلبات المشرف، ورفض وصول العميل إلى المسار الإداري بـ403. وأختم بأنها أدلة تشغيل محلي لا قبول نهائي ولا بيئة عامة.

### Português — Português do Brasil
"Este é o slide de evidências, e eu sempre cito a data: a verificação é de **16/09/2026** — é o resultado de uma rodada específica, não uma garantia do estado atual. Nessa rodada, **22 de 22 testes automatizados passaram nas Fases 1 a 6, com zero falhas**. Os checks locais cobriram: home e catálogo respondendo 200, login de admin e de cliente, pedidos do cliente autenticado, produtos e pedidos do administrador, e o cliente recebendo 403 no endpoint administrativo. Deixo claro que isso é evidência de execução local — não aceitação final nem ambiente público. E se eu for rodar de novo hoje, repito os testes antes de afirmar qualquer coisa."

---

## Slide 10 — Limites do protótipo

### Arabic — العربية (شرح كامل)
هذه الشريحة تبني المصداقية لأنني صريح بالنطاق. أولًا الدفع محاكى: لا توجد بوابة دفع ولا توصيل ولا لوجستيات ولا تكامل خارجي. ثانيًا التشغيل أكاديمي محلي: لا نشر عام ولا اتفاقية مستوى خدمة. ثالثًا لا توجد حزمة Playwright E2E موثقة؛ صور `docs/screenshots` محلية حقيقية تغطي المتجر والإدارة والعرض نفسه، لكنها ليست ست براهين بصرية منفصلة لكل تدفق. رابعًا هذا نموذج دراسة: أي إعادة استخدام تتطلب تقييمًا جديدًا للأمان والخصوصية والتشغيل. الصدق هنا يزيد الثقة ولا ينقصها.

### Português — Português do Brasil
"Este slide constrói credibilidade porque eu sou honesto sobre o escopo. Primeiro: checkout simulado — não há pagamento, entrega, logística ou integração externa. Segundo: execução local acadêmica — sem deploy público, sem URL pública e sem SLA. Terceiro: não existe suíte Playwright E2E documentada; as screenshots em `docs/screenshots` são reais e locais, cobrindo vitrine, administração e este deck, mas não são seis provas visuais separadas de cada fluxo. Quarto: é um protótipo de estudo — qualquer reutilização exige nova avaliação de segurança, privacidade e operação. Dizer isso com clareza valoriza o trabalho, não o contrário."

---

## Slide 11 — Demonstração local — sequência de verificação

### Arabic — العربية (شرح كامل)
هذه قائمة فحص قبل العرض، وليست ادعاء بخدمة دائمة. أرفع قاعدة البيانات، ثم أجهّز ملف `.env` محليًا من `.env.example` بمفتاح `JWT_SECRET` خاص لا أعرضه أبدًا، وأتأكد من تجهيز الحسابين التجريبيين محليًا. أشغّل الخادم وأفتح المنفذ المضبوط — الافتراضي 3000 أو ما ضبطته في `PORT` مثل 5500. أدخل بالحسابين وأمرّ على القائمة السريعة: كتالوج 200، طلب عميل، منتجات وطلبات المشرف، ثم 403 للعميل على `/api/admin`. إن لم يعمل شيء، أكمل بالشرائح فحسب — العرض الشفوي مصمم ليقف وحده.

### Português — Português do Brasil
"Esta é a checagem pré-apresentação, e o runtime local não é alegado como permanentemente online. A sequência: subir o banco com `docker compose up -d mongodb`; preparar o `.env` a partir do `.env.example` com um `JWT_SECRET` privado que nunca exibo, e preparar as contas demo conforme a documentação; iniciar com `node server/index.js`; abrir `http://localhost:3000` ou a porta do `PORT`, por exemplo 5500. Entrar com os dois perfis e rodar o checklist rápido: catálogo 200, pedido do cliente, produtos e pedidos do admin, e o 403 do cliente em `/api/admin`. Plano B: se a demo falhar na hora, sigo só com os slides — o roteiro funciona sem rede."

---

## Slide 12 — Conclusão e repositório

### Arabic — العربية (شرح كامل)
أختم بما أثبته المشروع فعلاً: فصل حقيقي بين الطبقات، تفويض مفحوص في الخادم، إنهاء طلب محاكى معلَن بصدق كمحاكاة، و22 اختبارًا ناجحًا في الجولة الموثقة بتاريخ 16/09/2026. الكود والتوثيق وتعليمات التشغيل المحلي متاحة في مستودع GitHub للمشروع AutoPart-SyncDistributed، وهي قابلة لإعادة الاستخدام كأساس لأعمال مستقبلية بعد مراجعة وتقييم جديد للأمان والتشغيل. أشكر الحضور وأفتح باب الأسئلة.

### Português — Português do Brasil
"Fecho com o que ficou demonstrado: separação real de camadas, autorização no servidor, checkout simulado declarado como simulação, e 22 de 22 testes verificados na rodada de 16/09/2026 — um protótipo local honesto. O código, o README com execução local verificada e a documentação estão no repositório GitHub do projeto AutoPart-SyncDistributed, reaproveitável como base para trabalhos futuros após nova avaliação de segurança e operação. Obrigado! Perguntas?"

---

## مقاطع العرض العملي — Páginas do aplicativo

> هذه فقرات إضافية عند الانتقال من الشرائح إلى التطبيق. اختبر التسلسل مسبقًا؛ الطلبات التجريبية تغيّر بيانات العرض والمخزون.

### 1. الصفحة الرئيسية والكتالوج — Vitrine e catálogo

**العربية:** هذه واجهة المتجر العامة. أستطيع استعراض القطع والبحث باسمها أو تصفيتها حسب الماركة والموديل والتصنيف. أفتح قطعة لأعرض السعر والمخزون والمركبات المتوافقة؛ البيانات في هذا المثال افتراضية.

**Português:** Esta é a vitrine pública. Posso consultar as peças, pesquisar pelo nome e filtrar por marca, modelo e categoria. Ao abrir uma peça, mostro o preço, o estoque e os veículos compatíveis; os dados desta demonstração são fictícios.

### 2. الدخول والحساب — Entrada e conta

**العربية:** من هنا يدخل العميل أو المشرف بحساب العرض المناسب. بعد الدخول تحدد صلاحية الحساب الصفحات والعمليات المسموحة له. فحص الصلاحية يتم في الخادم أيضًا، وليس عبر إخفاء الزر فقط.

**Português:** Aqui o cliente ou o administrador entra com sua conta de demonstração. Depois do login, o perfil define quais páginas e operações são permitidas. A autorização também é verificada no servidor, não apenas escondendo botões.

### 3. السلة والطلب — Carrinho e pedido

**العربية:** أضيف قطعة متوفرة إلى السلة وأختار الكمية. السلة تعرض تقديرًا، وعند تأكيد الطلب يتحقق الخادم من السعر والمخزون ويحسب الإجمالي مجددًا. يُسجل طلب تجريبي وتُخصم الكمية؛ لا يوجد دفع حقيقي.

**Português:** Adiciono uma peça disponível ao carrinho e escolho a quantidade. O carrinho mostra uma estimativa; ao confirmar, o servidor verifica preço e estoque e calcula o total novamente. Um pedido simulado é registrado e o estoque é reduzido, sem pagamento real.

### 4. طلباتي — Meus pedidos

**العربية:** في صفحة طلباتي يستطيع العميل رؤية الطلبات المرتبطة بحسابه وحالة كل طلب. أفتح أحد الطلبات لأعرض القطع والكميات والإجمالي المحفوظ. الطلبات الظاهرة في بيئة العرض اصطناعية.

**Português:** Na página Meus pedidos, o cliente consulta os pedidos vinculados à própria conta e seus status. Abro um pedido para mostrar peças, quantidades e o total registrado. Os pedidos desta demonstração são fictícios.

### 5. مركز الإدارة — Central de operações

**العربية:** بعد الدخول كمشرف أفتح مركز العمليات، حيث أرى المنتجات والطلبات وأبحث بينها. يمكن للمشرف إضافة منتج أو تعديل سعره ومخزونه ومتابعة حالات الطلبات. أتجنب إجراء تغييرات غير ضرورية أثناء العرض حتى تبقى البيانات جاهزة للتجربة.

**Português:** Depois de entrar como administrador, abro a Central de operações, onde consulto e pesquiso produtos e pedidos. O administrador pode adicionar produto, alterar preço e estoque e acompanhar os status. Evito alterações desnecessárias durante a apresentação para preservar os dados da demonstração.

### 6. القطع والحركات والتقارير — Peças, movimentações e relatórios

**العربية:** في شاشة القطع أستعرض المخزون وأبحث عن قطعة محددة. وفي الحركات يمكن تسجيل دخول أو خروج مع توضيح السبب، بينما تلخص التقارير حالة المخزون والحركات المسجلة. الطلبات التاريخية الاصطناعية لا تعني وجود حركة مخزون تاريخية لكل واحد منها.

**Português:** Na tela de peças, consulto o estoque e pesquiso uma peça específica. Em Movimentações é possível registrar entrada ou saída com motivo; em Relatórios, vejo resumos do estoque e das movimentações registradas. Os pedidos históricos fictícios não significam que exista uma movimentação histórica para cada um deles.

---

## Perguntas prováveis do professor — أسئلة متوقعة وإجاباتها

### 1. Onde está o "distribuído" do nome? — أين "التوزيع" في الاسم؟
**AR:** "اليوم يوجد فصل منطقي بين المتصفح والـAPI وقاعدة البيانات: Express يقدم الواجهة والـAPI من عملية واحدة، وMongoDB خدمة محلية منفصلة. لا توجد خوادم متعددة ولا موازنة أحمال ولا توفر عالٍ — هذا هو نطاق التنفيذ الحالي رغم الاسم."
**PT:** "Hoje existe separação lógica entre navegador, API e banco de dados: o Express serve frontend e API de um único processo, e o MongoDB é um serviço local separado. Não há múltiplos servidores, balanceamento de carga ou alta disponibilidade — esse é o alcance da implementação atual, apesar do nome."

### 2. Por que MongoDB com replica set de um membro? — لماذا replica set بعضو واحد؟
**AR:** "يستخدم MongoDB المحلي replica set اسمه rs0 بعضو واحد لأن معاملات الطلب والمخزون تتطلب replica set. هذا ليس تكرارًا ولا توفرًا عاليًا، بل شرط تقني لعمل المعاملات في البيئة المحلية."
**PT:** "O MongoDB local usa um replica set `rs0` de membro único porque as transações de pedido e estoque exigem replica set. Isso não é redundância nem alta disponibilidade — é um requisito técnico para as transações funcionarem no ambiente local."

### 3. O que impede um cliente de comprar com preço alterado? — ما الذي يمنع الشراء بسعر معدّل؟
**AR:** "الخادم لا يعتمد على السعر أو المخزون المرسَل من المتصفح: عند إنهاء الطلب يعيد التحقق من السعر والمخزون من قاعدة البيانات. لو عدّلت السعر في أدوات المطوّر، فالإجمالي المؤكَّد يبقى المحسوب في الخادم."
**PT:** "O servidor não confia no preço nem no estoque enviados pelo navegador: o checkout revalida preço e estoque a partir da base. Se eu mudar o preço nas ferramentas do desenvolvedor, o total confirmado continua sendo o calculado pelo servidor."

### 4. O checkout tem pagamento real? — هل الدفع حقيقي؟
**AR:** "لا. الطلب محاكاة: يُحفظ الطلب ويُخفَّض المخزون، لكن لا توجد بوابة دفع ولا فاتورة ولا شحن ولا لوجستيات."
**PT:** "Não. É um pedido simulado: o pedido é persistido e o estoque baixa, mas não há gateway de pagamento, fatura, entrega ou logística."

### 5. Os testes garantem que funciona hoje? — هل الاختبارات تضمن العمل اليوم؟
**AR:** "لا. نتيجة 22 من 22 موثقة بجولة بتاريخ 16/09/2026. إن سُئلت هل يعمل الآن، فإجابتي الصادقة: الدليل مؤرَّخ، وأعيد تشغيل الاختبارات قبل أن أؤكد أن الجولة الحالية تنجح."
**PT:** "Não. Os 22/22 são da verificação de 16/09/2026. Se o professor perguntar se roda agora, minha resposta honesta é: a evidência é datada; eu reexecuto os testes antes de afirmar que a rodada atual passa."

### 6. Pode ir para produção ou comércio real? — هل يصلح للإنتاج أو التجارة الحقيقية؟
**AR:** "ليس بعد: ينقص الدفع والشحن والتشغيل العام وتقييم كامل للأمان والخصوصية. هو نموذج دراسي يمكن إعادة استخدامه كأساس بعد مراجعة جديدة."
**PT:** "Ainda não: faltam pagamento, entrega, operação pública e uma avaliação completa de segurança e privacidade. É um protótipo de estudo, reutilizável como base após nova avaliação."
