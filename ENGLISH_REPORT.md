# AutoPart-SyncDistributed - Comprehensive Technical Report

## 📋 Project Overview

**AutoPart-SyncDistributed** is a complete full-stack web application for managing auto parts inventory in automotive stores. The system provides real-time tracking of auto parts, stock movement monitoring, supplier management, and analytical reports.

### 🎯 Purpose
This project demonstrates a complete inventory management system with:
- Real-time stock tracking
- Entry and exit movement recording
- Low stock alerts
- Supplier and category management
- Role-based user authentication (RBAC)
- User management with CRUD endpoints
- Input validation (email, password, profile enum)
- Data visualization with charts

---

## 🏗️ System Architecture

### Project Structure
```
AutoPart-SyncDistributed/
├── client/                 # Frontend (Vanilla JS + Tailwind CSS)
│   ├── index.html         # Main HTML file
│   ├── css/style.css     # Styles
│   └── js/
│       ├── app.js        # Frontend logic
│       └── api.js        # API client
├── server/                # Backend (Node.js + Express)
│   ├── index.js          # Entry point
│   ├── seed.js           # Database seeder
│   └── src/
│       ├── app.js        # Express app configuration
│       ├── config/db.js  # In-memory MongoDB config
│       ├── models/       # Mongoose schemas
│       ├── routes/       # API endpoints
│       ├── controllers/  # Business logic
│       └── middleware/   # Auth & validation
└── node_modules/
```

### How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Express.js  │────▶│  In-Memory DB   │
│  (Client)   │◀────│   Server     │◀────│   (MongoDB)     │
└─────────────┘     └──────────────┘     └─────────────────┘
       │                    │                      ▲
       │              ┌──────┴──────┐               │
       │              │             │               │
   HTML/CSS        Auth +       Routes +        Mongoose
   Vanilla JS      JWT          Controllers      Models
```

---

## 💻 Technology Stack

### Backend
- **Node.js** — JavaScript runtime environment
- **Express.js v5** — Web framework for REST API
- **MongoDB** — NoSQL database (in-memory)
- **Mongoose v9** — ODM for MongoDB schema modeling
- **JWT** — Token-based authentication
- **bcryptjs** — Password hashing
- **CORS** — Cross-origin resource sharing

### Frontend
- **HTML5** — Page structure
- **Tailwind CSS** — Utility-first CSS framework
- **Vanilla JavaScript** — Client-side interactivity
- **Chart.js** — Data visualization
- **Font Awesome** — Icon library

---

## 🗄️ Database Schema

### Models

#### 1. Part ( peça/auto part)
```javascript
{
  codigo: String,           // Part code (e.g., "ALT-008")
  nome: String,             // Part name
  descricao: String,       // Description
  preco_custo: Number,     // Cost price
  preco_venda: Number,     // Selling price
  estoque_atual: Number,   // Current stock quantity
  estoque_minimo: Number,  // Minimum stock threshold
  categoria: String,       // Category reference
  fornecedor: String,     // Supplier reference
  ativo: Boolean,         // Active status
  criado_em: Date,        // Creation date
  atualizado_em: Date    // Last update
}
```

#### 2. Category ( categoria )
```javascript
{
  nome: String,           // Category name
  descricao: String       // Description
}
```

#### 3. Supplier ( fornecedor )
```javascript
{
  nome: String,           // Supplier name
  cnpj: String,           // CNPJ (Brazilian tax ID)
  telefone: String,      // Phone number
  email: String,         // Email
  ativo: Boolean         // Active status
}
```

#### 4. Movement ( movimentação )
```javascript
{
  peca_id: String,       // Part reference
  tipo: String,          // "entrada" (entry) or "saida" (exit)
  quantidade: Number,    // Quantity
  usuario: String,       // User who made the movement
  observacao: String,   // Notes
  data: Date            // Movement date
}
```

#### 5. User ( usuário )
```javascript
{
  nome: String,           // User name
  email: String,          // Email (unique, validated)
  senha: String,          // Hashed password (bcrypt, min 6 chars)
  perfil: String,         // Role: "admin", "operador", "consulta"
  ativo: Boolean,         // Active status (inactive users cannot login)
  criado_em: Date,        // Creation date
  atualizado_em: Date     // Last update
}
```

---

## 🔌 API Endpoints

### Authentication
- **Method**: `POST` **Endpoint**: `/api/auth/login` — User login (returns JWT). Inactive users are blocked from logging in.
- **Method**: `GET` **Endpoint**: `/api/auth/me` — Get current authenticated user info

### Users (User Management — Admin Only)
- **Method**: `GET` **Endpoint**: `/api/users` — List all users (admin only)
- **Method**: `POST` **Endpoint**: `/api/users` — Create new user (admin only)
- **Method**: `PATCH` **Endpoint**: `/api/users/:id/status` — Toggle user active/inactive status (admin only)

### Parts (Peças)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pecas` | List all parts |
| GET | `/api/pecas/:id` | Get specific part |
| POST | `/api/pecas` | Add new part |
| POST | `/api/pecas/entrada` | Record stock entry |
| POST | `/api/pecas/saida` | Record stock exit |
| GET | `/api/pecas/history` | Get movement history |

### Categories & Suppliers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categorias` | List categories |
| GET | `/api/fornecedores` | List suppliers |

---

## 🔐 Security Features

1. **JWT Authentication**
   - Token-based login system
   - Tokens expire after 24 hours
   - Inactive users (`ativo: false`) cannot login — blocked at authentication

2. **Password Encryption**
   - bcryptjs hashing with salt rounds
   - Passwords never stored in plain text
   - Minimum password length: 6 characters

3. **Role-Based Access Control (RBAC)**
   - **Admin** (`admin`): Full access — manage parts, movements, categories, suppliers, and users (CRUD)
   - **Operator** (`operador`): Can record stock movements, view parts and reports
   - **Consulta** (`consulta`): Read-only access to parts, movements, and reports
   - User management endpoints (`/api/users`) restricted to admin role only

4. **Input Validation**
   - Email format validation (must be valid email)
   - Password minimum length: 6 characters
   - Profile (`perfil`) must be one of: `admin`, `operador`, `consulta`
   - Required fields enforced on all models
   - Server-side validation with descriptive error messages

5. **CORS Protection**
   - Configured to allow specific origins

---

## 📊 Current Data

The database comes pre-seeded with:

- **8 Auto Parts**: Including Alternator, Brake Pads, Oil Filter, Spark Plugs, etc.
- **4 Categories**: Electrical, Brakes, Engine, Suspension
- **2 Suppliers**: AutoParts Brasil, MotorMax Ltda
- **3 Seed Users**:
  - Admin: `admin@autopecas.com` / `admin123` (profile: admin, active)
  - Operator: `operador@autopecas.com` / `oper123` (profile: operador, active)
  - Consulta: `consulta@autopecas.com` / `consulta123` (profile: consulta, active)

---

## 🚀 How to Run

### Prerequisites
- Node.js installed (v14+)
- npm package manager

### Installation
```bash
# Navigate to server directory
cd AutoPart-SyncDistributed/server

# Install dependencies
npm install
```

### Running
```bash
# Start the server
node index.js
```

Or with custom port:
```bash
PORT=3001 node index.js
```

### Access
- **Web Interface**: http://localhost:3001
- **API Endpoint**: http://localhost:3001/api/ping
- **Test Login**: admin@autopecas.com / admin123

---

## 📱 User Interface Screens

1. **Login Screen** - Secure authentication (inactive users blocked)
2. **Dashboard** - Statistics overview, low stock alerts
3. **Parts Catalog** - View and manage auto parts
4. **Movements** - Track all stock entries/exits
5. **Users Management** - Admin-only page to create users, view all users, and toggle active/inactive status
6. **Reports** - Visual charts and analytics

---

## ⚡ Key Features Demonstrated

- ✅ RESTful API design
- ✅ JWT authentication flow
- ✅ In-memory database for development
- ✅ CRUD operations
- ✅ User management with CRUD endpoints
- ✅ Real-time stock tracking
- ✅ Low stock alerts
- ✅ Role-based access control (RBAC)
- ✅ Input validation (email, password, profile enum)
- ✅ Responsive design
- ✅ Data visualization
- ✅ Users management page (admin)

---

## 📝 Technical Notes

1. **In-Memory Database**: The project uses `mongodb-memory-server` which creates a temporary MongoDB instance in RAM. No external MongoDB installation is needed.

2. **Static File Serving**: The Express server directly serves the frontend files from the `/client` directory.

3. **Seed Data**: On startup, the system automatically seeds the database with sample data for demonstration.

4. **CORS**: Enabled for all origins during development.

---

## 🔗 Links

- **GitHub Repository**: https://github.com/MamdouhAlsaodi/AutoPart-SyncDistributed
- **Author**: Mamdouh Alsaudi
- **Email**: mamdouhalsaudi@gmail.com
- **LinkedIn**: https://www.linkedin.com/in/mamdouh-alsaudi-188693381/

---

*Report generated for academic presentation*
*Project: AutoPart-SyncDistributed v2.0*
*Date: May 19, 2026*
*Developer: Mamdouh Alsaudi*