# 🚗 AutoPart-SyncDistributed

<div align="center">

**A Modern Auto Parts Management System**

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com/MamdouhAlsaodi/AutoPart-SyncDistributed)
[![Node.js](https://img.shields.io/badge/Node.js-24.14.1-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)

**By:** Mamdouh Alsaudi

</div>

---

## 📖 What is this project?

**AutoPart-SyncDistributed** is a complete web application for managing auto parts inventory. It helps businesses track parts movements, monitor stock levels, and generate reports.

### **What can you do with it?**
- ✅ Track auto parts in real-time
- ✅ Record when parts enter or leave inventory
- ✅ Get alerts when stock is running low
- ✅ View reports and charts
- ✅ Manage suppliers and categories
- ✅ Secure user access

---

## 🌐 Choose Language | اختر اللغة

| 🇬🇧 English | 🇧🇷 Português | 🇸🇦 العربية |
|-------------|-------------|-----------|
| [REPORT.md](./REPORT.md) | [RELATORIO_PT.md](./RELATORIO_PT.md) | [RELATORIO_AR.md](./RELATORIO_AR.md) |

---

## 🚀 Quick Start

### **Try it now:**
- **Web Interface:** http://localhost:3000
- **API Documentation:** Check `/api` endpoints below

### **Test Account:**
| Field | Value |
|-------|-------|
| **Email** | admin@autopecas.com |
| **Password** | admin123 |

---

## 💼 About the Author

**Name:** Mamdouh Alsaudi  
**Role:** Full Stack Developer / Software Engineer  
**Email:** mamdouhalsaudi@gmail.com  
**LinkedIn:** [mamdouh-alsaudi-188693381](https://www.linkedin.com/in/mamdouh-alsaudi-188693381/)

---

## 🛠️ Tech Stack

### **Backend:**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password encryption

### **Frontend:**
- **HTML5** - Structure
- **Tailwind CSS** - Styling
- **Vanilla JavaScript** - Interactivity
- **Chart.js** - Data visualization
- **Font Awesome** - Icons

---

## 📋 Key Features

| Feature | Description |
|---------|-------------|
| 📦 **Inventory Tracking** | Real-time stock levels |
| 📊 **Reports** | Charts and analytics |
| 🔔 **Alerts** | Low stock notifications |
| 🔐 **Security** | JWT authentication |
| 👥 **User Management** | Role-based access (admin, operator, viewer) |
| 🔍 **Search** | Find parts quickly |

---

## 🌐 API Endpoints

### **Authentication:**
```
POST   /api/auth/login    - Login
GET    /api/auth/me       - Get user info
```

### **Parts:**
```
GET    /api/pecas                 - List all parts
GET    /api/pecas/:id             - Get specific part
POST   /api/pecas                 - Add new part
```

### **Movements:**
```
GET    /api/pecas/history          - Movement history
POST   /api/pecas/entrada          - Add stock entry
POST   /api/pecas/saida            - Record stock exit
```

### **Categories & Suppliers:**
```
GET    /api/categorias             - List categories
GET    /api/fornecedores           - List suppliers
```

---

## 📦 How to Run

```bash
# 1. Navigate to server directory
cd AutoPart-SyncDistributed/server

# 2. Install dependencies
npm install

# 3. Start the server
node index.js

# 4. Open your browser
# http://localhost:3000
```

---

## 📊 System Screens

| Screen | Description |
|--------|-------------|
| 📝 **Login** | Secure user authentication |
| 📈 **Dashboard** | Statistics and alerts |
| 🔧 **Parts Catalog** | View and manage parts |
| 📋 **Movements** | Track all inventory movements |
| 📊 **Reports** | Visual analytics with charts |

---

## 🎨 Design Preview

The system features a clean, modern interface with:
- 🎨 Blue and white color scheme
- 📱 Fully responsive design
- ⚡ Fast performance
- ♿ Accessible and user-friendly

---

## 📈 Project Statistics

| Metric | Value |
|--------|-------|
| **Total Parts** | 8 |
| **Categories** | 4 |
| **Suppliers** | 2 |
| **Users** | 2 |
| **API Endpoints** | 15+ |

---

## 🔐 Security Features

- 🔒 **JWT Authentication** - Secure token-based auth
- 🛡️ **Password Hashing** - bcrypt encryption
- 👮 **Role-Based Access** - 3 permission levels
- ✅ **Input Validation** - All data validated
- 🔐 **CORS Protection** - Cross-origin protection

---

## 🚀 Future Enhancements

- [ ] Edit and delete parts
- [ ] Export reports to PDF/Excel
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Barcode/QR code support
- [ ] Multi-language UI

---

## 📝 License

This project is for educational and demonstration purposes.

---

## 🙏 Acknowledgments

Built with modern web technologies and following best practices for full-stack development.

---

<div align="center">

**📧 Contact:** mamdouhalsaudi@gmail.com

**🔗 GitHub:** [MamdouhAlsaodi/AutoPart-SyncDistributed](https://github.com/MamdouhAlsaodi/AutoPart-SyncDistributed)

</div>

---

## 🇸🇦 ما هو هذا المشروع؟ - ملخص بالعربية

**نظام AutoPart-SyncDistributed** هو تطبيق ويب متكامل لإدارة مخزون قطع غيار السيارات. يساعد الشركات على تتبع حركة القطع، مراقبة مستويات المخزون، وإنشاء تقارير.

### **ماذا يمكنك فعله به؟**
- ✅ تتبع قطع الغيار في الوقت الفعلي
- ✅ تسجيل دخول وخروج القطع من المخزون
- ✅ الحصول على تنبيهات عند انخفاض المخزون
- ✅ عرض التقارير والرسوم البيانية
- ✅ إدارة الموردين والتصنيفات
- ✅ وصول آمن للمستخدمين

---

## 🚀 كيفية التشغيل

```bash
# 1. الدخول إلى مجلد السيرفر
cd AutoPart-SyncDistributed/server

# 2. تثبيت المكتبات المطلوبة
npm install

# 3. تشغيل السيرفر
node index.js

# 4. فتح المتصفح
# http://localhost:3000
```

### **بيانات الدخول للتجربة:**
| الحقل | القيمة |
|-------|-------|
| **البريد الإلكتروني** | admin@autopecas.com |
| **كلمة المرور** | admin123 |

---

## 📋 المميزات الرئيسية

| الميزة | الوصف |
|--------|-------|
| 📦 **تتبع المخزون** | مستويات المخزون في الوقت الفعلي |
| 📊 **التقارير** | رسوم بيانية وتحليلات |
| 🔔 **التنبيهات** | إشعارات انخفاض المخزون |
| 🔐 **الأمان** | مصادقة JWT |
| 👥 **إدارة المستخدمين** | صلاحيات متعددة (مدير، مشغل، مشاهدة) |
| 🔍 **البحث** | البحث السريع في القطع |

---

## 💼 عن المطور

**الاسم:** ممدوح السدي  
**الدور:** مطور Full Stack / مهندس برمجيات  
**البريد الإلكتروني:** mamdouhalsaudi@gmail.com  
**LinkedIn:** [mamdouh-alsaudi-188693381](https://www.linkedin.com/in/mamdouh-alsaudi-188693381/)

---

## 🛠️ التقنيات المستخدمة

### **الخلفية (Backend):**
- **Node.js** - بيئة تشغيل JavaScript
- **Express.js** - إطار عمل الويب
- **MongoDB** - قاعدة البيانات
- **Mongoose** - ODM لـ MongoDB
- **JWT** - المصادقة
- **bcryptjs** - تشفير كلمات المرور

### **الواجهة (Frontend):**
- **HTML5** - الهيكل
- **Tailwind CSS** - التصميم
- **Vanilla JavaScript** - التفاعل
- **Chart.js** - تصور البيانات
- **Font Awesome** - الأيقونات

---

## 📊 شاشات النظام

| الشاشة | الوصف |
|--------|-------|
| 📝 **تسجيل الدخول** | مصادقة المستخدم الآمنة |
| 📈 **لوحة التحكم** | الإحصائيات والتنبيهات |
| 🔧 **كتالوج القطع** | عرض وإدارة القطع |
| 📋 **الحركات** | تتبع جميع حركات المخزون |
| 📊 **التقارير** | التحليلات المرئية بالرسوم البيانية |

---

## 🎨 تصميم الواجهة

يتميز النظام بواجهة نظيفة وعصرية:
- 🎨 نظام ألوان أزرق وأبيض
- 📱 تصميم متجاوب بالكامل
- ⚡ أداء سريع
- ♿ سهل الاستخدام

---

## 📈 إحصائيات المشروع

| المقياس | القيمة |
|--------|-------|
| **إجمالي القطع** | 8 |
| **التصنيفات** | 4 |
| **الموردين** | 2 |
| **المستخدمين** | 2 |
| **نقاط الـ API** | 15+ |

---

## 🔐 ميزات الأمان

- 🔒 **مصادقة JWT** - توثيق آمن بالرموز
- 🛡️ **تشفير كلمات المرور** - تشفير bcrypt
- 👮 **صلاحيات متعددة** - 3 مستويات صلاحية
- ✅ **التحقق من البيانات** - جميع البيانات موثقة
- 🔐 **حماية CORS** - حماية عبر الأصول

---

## 🚀 تحسينات مستقبلية

- [ ] تعديل وحذف القطع
- [ ] تصدير التقارير إلى PDF/Excel
- [ ] إشعارات بالبريد الإلكتروني
- [ ] تطبيق موبايل (React Native)
- [ ] دعم الباركود / QR Code
- [ ] واجهة متعددة اللغات

---

<div align="center">

**📧 للتواصل:** mamdouhalsaudi@gmail.com

**🔗 GitHub:** [MamdouhAlsaodi/AutoPart-SyncDistributed](https://github.com/MamdouhAlsaodi/AutoPart-SyncDistributed)

</div>

---

**Version:** 1.0  
**Status:** ✅ Production Ready  
**Last Updated:** April 23, 2026
