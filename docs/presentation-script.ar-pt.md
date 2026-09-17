# AutoPart-SyncDistributed — نص العرض التقديمي (عربي + Português)

> نص مقسم صفحة-بصفحة للعرض الأكاديمي المحلي. كل صفحة: النص العربي ثم نظيره البرتغالي.
> يعكس هذا النص الحالة المُتحقق منها في 2026-09-16: 22 اختبارًا آليًا ناجحًا و0 فشل عبر المراحل 1–6، وتشغيل محلي على <http://localhost:5500>.
> بصدق: لا توجد اختبارات Playwright E2E. توجد الآن لقطات شاشة محلية حقيقية للمتجر والإدارة والعرض HTML، لكنها ليست تغطية بصرية منفصلة لكل واحدة من البراهين الستة. التشغيل محلي لأغراض العرض الأكاديمي ولا يُزعم أنه متاح دائمًا.

---

## الصفحة 1 — الشريحة الافتتاحية

**عربي:**
دراسة حالة أكاديمية: AutoPart-SyncDistributed. من ورشة لإدارة المخزون إلى نموذج أولي محلي لمتجر إلكتروني لقطع غيار السيارات. تطبيق ويب بفصل كامل بين الواجهة والخادم وقاعدة البيانات، يعمل محليًا لأغراض العرض الأكاديمي على <http://localhost:5500> — بدون سحابة وبدون تكاليف خارجية.

**Português:**
Estudo de caso acadêmico: AutoPart-SyncDistributed. Da gestão de estoque da oficina a um protótipo local de e-commerce de peças automotivas. Aplicação web com separação completa entre cliente, servidor e banco de dados, executada localmente para fins acadêmicos em <http://localhost:5500> — sem nuvem e sem custos externos.

---

## الصفحة 2 — المشكلة والقيمة

**عربي:**
المشكلة: إدارة المخزون اليدوية بطيئة وعرضة للأخطاء وبدون سجل موثوق للطلبات. القيمة المقترحة: رقمنة الكتالوج والسلة والطلبات مع مخزون مركزي لدى الخادم كمصدر وحيد للحقيقة. ملفا الاستخدام: العميل النهائي والمشرف.

**Português:**
O problema: o controle manual de estoque é lento, propenso a erros e sem histórico confiável de pedidos. O valor proposto: digitalizar catálogo, carrinho e pedidos com estoque centralizado no servidor como fonte única de verdade. Dois perfis de uso: cliente final e administrador.

---

## الصفحة 3 — المعمارية

**عربي:**
ثلاث طبقات، تطبيق واحد. الواجهة: Vanilla JavaScript (HTML/CSS/JS) تُقدَّم كموقع ثابت من الخادم نفسه. الخادم: Node.js مع Express وواجهة REST بـ JSON. قاعدة البيانات: MongoDB عبر Mongoose مع حفظ محلي. كل التواصل بين الواجهة والخادم يتم عبر API فقط.

**Português:**
Três camadas, uma aplicação. Cliente: Vanilla JavaScript (HTML/CSS/JS), servido como site estático pelo próprio servidor. Servidor: Node.js com Express, API REST em JSON. Banco: MongoDB com Mongoose e persistência local. Toda a comunicação cliente-servidor acontece exclusivamente via API.

---

## الصفحة 4 — الأمان

**عربي:**
تسجيل ودخول مع تحقق من طرف الخادم. كلمات السر محفوظة بتجزئة bcrypt ولا تُخزن نصًا صريحًا أبدًا. جلسات JWT موقّعة، وJWT_SECRET يأتي من الإعداد الخاص ولا يُنشر أبدًا. منطقة الإدارة محمية بصلاحية الملف الشخصي (admin) على مستوى الـAPI، وقد تحقق محليًا أن العميل يتلقى 403 عند محاولة الوصول إلى واجهة الإدارة.

**Português:**
Registro e login com validação no servidor. Senhas protegidas com hash bcrypt — nunca armazenadas em texto puro. Sessões JWT assinadas; o `JWT_SECRET` vem da configuração privada e nunca é publicado. Área administrativa protegida por perfil (admin) no nível da API; verificado localmente que o cliente recebe 403 ao tentar acessar endpoint administrativo.

---

## الصفحة 5 — المتجر

**عربي:**
واجهة متجر عامة تعرض المميزة والأقسام. بطاقة القطعة تعرض التوافق والسعر والمخزون. بحث بالاسم والماركة والموديل، مع فلترة حسب القسم والتوفر.

**Português:**
Vitrine pública com destaques e categorias. A ficha da peça mostra compatibilidade, preço e estoque. Busca por nome, marca e modelo, com filtros por categoria e disponibilidade.

---

## الصفحة 6 — البيع

**عربي:**
سلة مشتريات محفوظة في المتصفح. الكميات والمجاميع تُحسب لحظيًا. إتمام الطلب (محاكاة) ينشئ طلبًا محفوظًا فعليًا في قاعدة البيانات، مع سجل طلبات لكل عميل وحالة كل طلب — لا يوجد دفع حقيقي.

**Português:**
Carrinho persistente no navegador. Quantidades e totais calculados em tempo real. O checkout simulado cria pedidos persistentes de verdade no banco, com histórico de pedidos por cliente e status de cada pedido — sem pagamento real.

---

## الصفحة 7 — الإدارة

**عربي:**
إدارة القطع من واجهة إدارية محمية: إنشاء وتعديل السعر والمخزون، وإدارة الطلبات وحالاتها. كل ذلك خلف صلاحية admin على مستوى الـAPI، لا في الواجهة فقط.

**Português:**
Gestão de peças pela interface administrativa protegida: criação e edição de preço e estoque, e gestão de pedidos e seus status. Tudo protegido pela autorização admin no nível da API — não apenas na interface.

---

## الصفحة 8 — الجودة (نتائج مُتحقق منها)

**عربي:**
تحقق في 2026-09-16: 22 اختبارًا آليًا ناجحًا و0 فشل عبر المراحل 1–6. فحوص تشغيل محلية: الرئيسية والكتالوج 200، دخول المدير والعميل بنجاح، طلبات العميل 200، منتجات وطلبات الإدارة 200، والعميل يتلقى 403 على واجهة الإدارة. توجد لقطات شاشة محلية حقيقية للمتجر والإدارة والعرض HTML، ولا توجد اختبارات Playwright E2E.

**Português:**
Verificação de 2026-09-16: 22 testes automatizados aprovados e 0 falhas nas Fases 1–6. Checagens locais de execução: home e catálogo 200, login de admin e cliente, pedidos do cliente 200, produtos e pedidos do admin 200, e o cliente recebe 403 no endpoint administrativo. Há screenshots locais reais da vitrine, da administração e do deck HTML; não há suíte Playwright E2E.

---

## الصفحة 9 — الحدود والخطوات التالية

**عربي:**
الحدود بصدق: الدفع محاكاة فقط، التشغيل محلي أكاديمي، ولا يوجد نشر عام أو اتفاقية مستوى خدمة. الخطوات التالية المحتملة (غير منفذة كادعاء): النشر على GitHub كمعرض أعمال، تقارير المبيعات، وتحسينات التشغيل المحلي.

**Português:**
Limites honestos: checkout simulado, execução local acadêmica, sem publicação pública e sem SLA. Próximos passos possíveis (não afirmados como prontos): publicação no GitHub como portfólio, relatórios de vendas e melhorias de operação local.

---

## الصفحة 10 — المستودع والعرض المحلي

**عربي:**
المستودع على GitHub مع README يتضمن خطوات تشغيل محلية مُتحقق منها وحسابي عرض تجريبي موثقين. قبل العرض: تشغيل الحزمة محليًا والتحقق من <http://localhost:5500> — لا نزعم أن الخدمة تعمل دائمًا أو أنها متاحة على الإنترنت.

**Português:**
Repositório no GitHub com README de execução local verificada e contas de demonstração acadêmica documentadas. Antes da apresentação: subir o ambiente local e validar <http://localhost:5500> — não afirmamos que o runtime está permanentemente online ou disponível na internet.

---

## ملاحظات الإلقاء (لك ممدوح، ليست في العرض)

- 10 páginas ≈ 8-10 دقائق.
- الصفحتان 8-9 هما الأقوى أمام الزملاء والأستاذ: أرقام مُتحقق منها بتاريخ، وحدود صادقة تُظهر نضجًا هندسيًا.
- قبل العرض مباشرة (تسلسل تحقق، وليس خدمة دائمة): شغّل MongoDB ثم الخادم، وافتح <http://localhost:5500> بحساب admin ثم cliente، وتأكد من: الكتالوج يفتح (200)، طلب تجريبي للعميل، منتجات وطلبات الـadmin، وأن العميل يأخذ 403 على واجهة الإدارة.
- لو سألوا عن "لماذا بدون React؟": Vanilla JS كان قرارًا تعليميًا لإظهار فهم DOM وfetch مباشرة قبل الأطر.
- لو سألوا عن الأمان: bcrypt للتجزئة + JWT للجلسات + فصل صلاحيات admin/cliente على مستوى الـAPI (دليل: 403 للعميل).
- لو سألوا عن النشر أو اللقطات: بصراحة، توجد screenshots محلية حقيقية للمتجر والإدارة والعرض HTML، لكن لا توجد Playwright E2E ولا تغطية بصرية منفصلة لكل البراهين الستة، ولا نشر عام — والـcheckout محاكاة فقط.
- كلمات السر المعروضة هي كلمة العرض الأكاديمية العامة `<SENHA_DEMO_LOCAL>` للحسابين `admin.demo@autopart.test` و`cliente.demo@autopart.test` — ولا تُعرض أبدًا قيمة `JWT_SECRET` الخاصة.
