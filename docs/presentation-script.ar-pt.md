# AutoPart-SyncDistributed — نص العرض التقديمي (عربي + Português)

> نص مقسم صفحة-بصفحة لمطابقة عرض `/help` بالضبط (10 صفحات). كل صفحة: النص العربي ثم نظيره البرتغالي كما يظهر في العرض. للشرح أمام الزملاء.

---

## الصفحة 1 — الشريحة الافتتاحية

**عربي:**
دراسة حالة أكاديمية: AutoPart-SyncDistributed. من ورشة لإدارة المخزون إلى نموذج أولي متكامل لمتجر إلكتروني لقطع غيار السيارات. تطبيق ويب حقيقي بفصل كامل بين الواجهة والخادم وقاعدة البيانات، ويعمل محليًا عبر شبكة Tailscale — بدون سحابة وبدون تكاليف خارجية.

**Português:**
Estudo de caso acadêmico: AutoPart-SyncDistributed. Da oficina de inventário a um protótipo completo de e-commerce de peças automotivas. Aplicação web real com separação completa entre cliente, servidor e banco de dados, executada localmente via Tailscale — sem nuvem e sem custos externos.

---

## الصفحة 2 — نظرة عامة

**عربي:**
المشكلة: إدارة المخزون اليدوية بطيئة وعرضة للأخطاء. الحل: AutoPart يرقمن الكتالوج وسلة المشتريات والطلبات. للنظام ملفا استخدام: العميل النهائي والمشرف، بمعمارية موزعة بسيطة: المتصفح ← واجهة API ← MongoDB.

**Português:**
O problema: o controle manual de estoque é lento e propenso a erros. A solução: o AutoPart digitaliza o catálogo, o carrinho e os pedidos. Dois perfis de uso: cliente final e administrador, com arquitetura distribuída simples: navegador → API → MongoDB.

---

## الصفحة 3 — المعمارية

**عربي:**
ثلاث طبقات، تطبيق واحد. الواجهة: JavaScript خالص مع Tailwind تُقدَّم كموقع ثابت. الخادم: Node.js 24 مع Express 5 وواجهة REST بJSON. قاعدة البيانات: MongoDB عبر Mongoose بحفظ دائم حقيقي. كل التواصل بين الواجهة والخادم يتم عبر API فقط.

**Português:**
Três camadas, uma aplicação. Cliente: Vanilla JavaScript + Tailwind, servido como site estático. Servidor: Node.js 24 + Express 5, API REST em JSON. Banco: MongoDB com Mongoose e persistência real. Toda a comunicação cliente-servidor acontece exclusivamente via API.

---

## الصفحة 4 — الأمان

**عربي:**
تسجيل ودخول العملاء مع تحقق من طرف الخادم. كلمات السر مشفرة بـbcrypt ولا تُخزن نصًا صريحًا أبدًا. جلسات JWT تنتهي بعد 8 ساعات. منطقة الإدارة محمية بصلاحية الملف الشخصي (admin).

**Português:**
Registro e login de clientes com validação no servidor. Senhas protegidas com hash bcrypt — nunca em texto puro. Sessões JWT com expiração de 8 horas. Área administrativa protegida por permissão de perfil (admin).

---

## الصفحة 5 — المتجر

**عربي:**
واجهة متجر عامة تعرض المميزة والأقسام. بطاقة القطعة تعرض التوافق والسعر والمخزون. بحث بالاسم والماركة والموديل، مع فلترة حسب القسم والتوفر.

**Português:**
Vitrine pública com destaques e categorias. A ficha da peça mostra compatibilidade, preço e estoque. Busca por nome, marca e modelo, com filtros por categoria e disponibilidade.

---

## الصفحة 6 — البيع

**عربي:**
سلة مشتريات محفوظة في المتصفح. الكميات والمجاميع الفرعية والإجمالي تُحسب لحظيًا. إتمام الطلب (محاكاة) ينشئ طلبًا محفوظًا فعلًا في قاعدة البيانات، مع سجل طلبات لكل عميل وحالة كل طلب.

**Português:**
Carrinho persistente no navegador. Quantidades, subtotais e total calculados em tempo real. O checkout simulado cria pedidos persistentes de verdade no banco, com histórico de pedidos por cliente e status de cada pedido.

---

## الصفحة 7 — الإدارة

**عربي:**
إدارة كاملة للقطع: إضافة وتعديل السعر والمخزون. حركات إدخال وإخراج المخزون مع سجل حركات كامل. إدارة الطلبات وتغيير حالتها، وتنبيه عند انخفاض المخزون.

**Português:**
Gestão completa de peças: criar, editar, preço e estoque. Entrada e saída de estoque com histórico de movimentações. Gestão de pedidos com alteração de status e alerta de estoque baixo.

---

## الصفحة 8 — الجودة

**عربي:**
اختبارات آلية للمراحل الرئيسية (API وتكامل)، واختبار E2E بمسار الشراء عبر Playwright. توثيق بلقطات شاشة لكل مرحلة داخل مجلد docs، وعقود API موثقة في المستودع.

**Português:**
Testes automatizados das fases principais (API + integração) e E2E com Playwright no fluxo de compra. Documentação com screenshots por fase em /docs e contratos de API versionados no repositório.

---

## الصفحة 9 — خارطة التطور

**عربي:**
المراحل من 0 إلى 6 مكتملة: من الكتالوج إلى التجارة الإلكترونية. القادم: مدفوعات محاكاة وتقارير مبيعات، ثم Docker Compose لتنسيق التشغيل الكامل، ونشر المشروع في GitHub كمعرض أعمال.

**Português:**
Fases 0-6 concluídas: do catálogo ao e-commerce. Próximo: pagamentos simulados e relatórios de venda, Docker Compose para orquestração completa e publicação do portfolio no GitHub.

---

## الصفحة 10 — المستودع

**عربي:**
المستودع على GitHub مع README يتضمن خطوات تشغيل محلية مُتحقق منها، وحسابات عرض تجريبية موثقة. والعرض الحالي يعمل حيًا على شبكة مقدم العرض.

**Português:**
Repositório no GitHub com README de execução local verificada e contas de demonstração acadêmica documentadas. Esta demonstração está rodando ao vivo na rede do apresentador.

---

## ملاحظات الإلقاء (لك ممدوح، ليست في العرض)

- 10 شرائح ≈ 8-10 دقائق.
- الشرائح 5-7 هي الأقوى أمام الزملاء: اعرض التطبيق الحي بجانب العرض (نافذة المتصفح على :5500 بحساب admin ثم cliente).
- لو سألوا عن "لماذا بدون React؟": Vanilla JS كان قرارًا تعليميًا لإظهار فهم DOM وfetch مباشرة قبل الأطر.
- لو سألوا عن الأمان: bcrypt + JWT + فصل صلاحيات admin/cliente على مستوى الـAPI.
