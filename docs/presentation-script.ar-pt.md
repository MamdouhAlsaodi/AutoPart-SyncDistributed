# Roteiro da apresentação / نص الإلقاء — AutoPart-SyncDistributed

هذا نص مساعد للإلقاء حسب ترتيب الشرائح الاثنتي عشرة في [العرض البرتغالي](apresentacao.html)، وليس تقريرًا بديلًا. [الشرح التقني الكامل بالعربية](EXPLICACAO-AR.md) يوضح المعمارية والحدود. نسخة العرض الحالية افتراضيًا على `http://127.0.0.1:3000/apresentacao` بعد تشغيل الخادم؛ إذا غيّرت `PORT` فغيّر الرابط وفقًا له. النتائج العددية أدناه تعود لفحص مؤرخ في **16-09-2026**، لا لفحص لحظي.

## 1. Abertura / البداية

**Português:** O AutoPart-SyncDistributed é um protótipo acadêmico local de comércio eletrônico de autopeças. Ele separa a interface do navegador, a API e o serviço de banco de dados; não afirmamos implantação em vários servidores.

**عربي:** عرّف المشروع كنموذج أولي لمتجر قطع غيار. الفصل هنا بين مسؤوليات المتصفح والخادم وقاعدة محلية، وليس نشرًا على عدة عقد.

## 2. Problema e valor / المشكلة والقيمة

**Português:** O controle manual de estoque dificulta a consulta e o acompanhamento. Propomos catálogo pesquisável, pedidos registrados e estoque controlado pelo servidor, dentro de um ambiente de demonstração.

**عربي:** المشكلة هي صعوبة ضبط المخزون ومتابعة الطلبات يدويًا. القيمة التعليمية: كتالوج قابل للبحث وطلبات تحفظ مركزيًا.

## 3. Usuários e papéis / الأدوار

**Português:** O cliente consulta peças e envia um pedido simulado; o administrador mantém produtos e acompanha pedidos. As contas genéricas só existem quando o seed local foi habilitado.

**عربي:** دور العميل مختلف عن المشرف؛ حسابات العرض التجريبية اختيارية، وكلمة سرها تُضبط محليًا ولا توضع في الشرائح.

## 4. Arquitetura / المعمارية

**Português:** O navegador em JavaScript consome a API Express por HTTP e JSON. O servidor valida as operações e usa Mongoose para persistir no MongoDB local. A interface e a API são entregues pelo mesmo processo Express; o banco é um serviço separado.

**عربي:** اشرح الأسهم الثلاثة: متصفح ← API ← MongoDB. لا تقل إن النظام موزع على خوادم كثيرة؛ replica set المحلي بعضو واحد يدعم المعاملات، لا التوافر العالي.

## 5. Vitrine / الكتالوج

**Português:** O catálogo público permite consulta, busca e filtros por características das peças, com preço e disponibilidade apresentados ao cliente.

**عربي:** اعرض البحث والفلاتر إن كان التشغيل المحلي جاهزًا؛ هذه شاشة استكشاف قبل الدخول.

## 6. Carrinho e pedidos / السلة والطلب

**Português:** O carrinho fica no navegador, mas o checkout autenticado recalcula valores e verifica estoque no servidor. O pedido é registrado no MongoDB; não há pagamento real.

**عربي:** شدد على أن سعر المتصفح غير موثوق وأن الخادم يعيد التحقق، وأن كلمة checkout هنا تعني **طلبًا تجريبيًا** لا بيعًا مدفوعًا.

## 7. Administração / الإدارة

**Português:** O administrador gerencia peças, preços, estoque e estados de pedidos por rotas protegidas no servidor, não apenas por um menu oculto na interface.

**عربي:** اختلاف الواجهات ليس حماية كافية؛ صلاحية المشرف تُتحقق في الـAPI.

## 8. Segurança / الأمان

**Português:** As senhas usam hash bcryptjs; tokens JWT são assinados com segredo configurado privadamente. Uma verificação local registrada mostrou que o cliente recebe 403 ao tentar acessar uma rota administrativa. Isso não equivale a uma auditoria completa de segurança.

**عربي:** لا تعرض `JWT_SECRET`. حالة 403 دليل محدود على رفض الوصول في الفحص المذكور، وليست شهادة جاهزية للإنتاج.

## 9. Evidências / الأدلة

**Português:** No registro de 16 de setembro de 2026, 22 testes automatizados passaram sem falhas. Também foram registrados testes locais de respostas 200 e 403. Esses resultados são datados e devem ser conferidos novamente antes da demonstração.

**عربي:** اربط الأرقام بتاريخ [مراجعة الجاهزية](READINESS-ASSESSMENT-2026-09-16.md)؛ لا تقدّمها كفحص حدث اليوم تلقائيًا.

## 10. Limitações / الحدود

**Português:** Não há pagamento, entrega, operação pública ou garantia de disponibilidade. Capturas locais mostram algumas telas, mas não substituem uma suíte Playwright de ponta a ponta nem a validação de produção.

**عربي:** الصراحة مهمة: المشروع تعليمي ومحلي، ولا توجد اختبارات Playwright E2E موثقة.

## 11. Demonstração local / العرض العملي

**Português:** Antes da apresentação, inicio o MongoDB e o servidor com configuração privada. Abro `http://127.0.0.1:3000` ou a porta definida em `PORT`, verifico catálogo, login das contas demo se habilitadas, pedido, administração e recusa 403 para um cliente.

**عربي:** حضّر `.env` محليًا ولا تعرض محتواه؛ تأكد من المنفذ الفعلي، وتدرّب على تسلسل العرض قبل القاعة. لا تجرِ اختبارات قد تحذف قاعدة بيانات العرض.

## 12. Conclusão / الختام

**Português:** Este protótipo documenta um fluxo de pedido com responsabilidades separadas e autorização no servidor, dentro de limites acadêmicos explícitos. O repositório contém código, instruções de execução, relatório e apresentação. Obrigado; fico à disposição para perguntas.

**عربي:** اختم بما أُنجز فعلًا وحدوده، ثم افتح باب الأسئلة.

## Perguntas frequentes / أسئلة متوقعة

- **Por que Express? / لماذا Express؟** لتنظيم HTTP وREST والـmiddleware في التطبيق الحالي، لا لأننا بنينا framework جديدًا.
- **Onde está a distribuição? / أين التوزيع؟** فصل مسؤوليات عميل وخادم وقاعدة محلية؛ لا يوجد عدة خوادم أو تحمل أعطال موزع.
- **Por que sem React? / لماذا لا React؟** استخدام Vanilla JS في هذا النموذج يسمح بإظهار DOM و`fetch` مباشرة؛ ليس تقييمًا ضد React.
- **É uma venda real? / هل هو بيع حقيقي؟** لا؛ إنشاء طلب وتحديث مخزون ضمن محاكاة، بلا دفع أو تسليم.
