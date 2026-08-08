# 🚀 NexusERP | Enterprise Mini ERP & CRM Operations Portal
> **Official Project Submission Document**

---

## 📌 1. Project Links & Live URLs

* **GitHub Repository**: [https://github.com/Priyangshu0011/ERP-CRM-Operations-Portal](https://github.com/Priyangshu0011/ERP-CRM-Operations-Portal)
* **Live Frontend Portal**: [https://erp-crm-operations-portal-pi.vercel.app](https://erp-crm-operations-portal-pi.vercel.app)
* **Live Backend REST API**: [https://mini-erp-backend-sb2u.onrender.com](https://mini-erp-backend-sb2u.onrender.com)

---

## 🔐 2. Test Login Credentials (All 4 Pre-seeded Roles)

Password for all pre-seeded accounts: **`password123`**

| Role | Email Account | Operational Access Scope & Privileges |
|---|---|---|
| 👑 **ADMIN** | `admin@erp.com` | Full System Authority: Dashboard, User Accounts, Customer CRM, Inventory Management, Sales Orders, Financial Challans & Audit Logs |
| 💼 **SALES** | `sales@erp.com` | Wholesale CRM & Sales Desk: Add/Edit Customer Accounts, Log Sales Call Notes, Create & Confirm Sales Challans |
| 📦 **WAREHOUSE** | `warehouse@erp.com` | Inventory Control: Product Catalog, Stock IN / OUT Manual Adjustments, Reorder Threshold Alerts, Stock Audit History |
| 💳 **ACCOUNTS** | `accounts@erp.com` | Financial Audit & Invoicing: View Sales Challans, Customer Billing Summaries, Tax Invoice Preview & PDF Printing |

---

## 🏗️ 3. System Architecture & Technical Design

The application follows an **enterprise-grade, decoupled client-server architecture**:

### **Backend Stack**:
- **Runtime**: Node.js with TypeScript & Express.js.
- **ORM & Database**: Prisma ORM with SQLite (for zero-config local dev & CI/CD) and dual-support for PostgreSQL.
- **Security & Authentication**: JSON Web Tokens (JWT) with bcrypt password hashing. Custom Express middleware (`authenticateJWT` & `requireRole`) blocks cross-role access at the API boundary.
- **Data Integrity & Concurrency**:
  - Atomic stock deductions executed within database transactions (`prisma.$transaction`).
  - Historical snapshot retention (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`) prevents past invoices from changing when product prices are modified or deleted.

### **Frontend Stack**:
- **Framework**: React (Vite) + TypeScript.
- **Styling & Aesthetics**: Tailwind CSS with custom glassmorphism, responsive grid system, dynamic role-based color coding, and subtle micro-animations.
- **State & Scope Management**: React Context (`AuthContext`) handling token storage, dynamic sidebar filtering, and reactive tab access control guards.

---

## 📮 4. API Endpoints & Postman Collection

A ready-to-import Postman collection is included in the project package:
`NexusERP_API_Postman_Collection.json`

### **Primary REST Endpoints**:

| Method | Route | Authorization Scope | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and return JWT bearer token |
| `GET` | `/api/auth/me` | All Roles | Retrieve authenticated user profile & assigned role |
| `GET` | `/api/customers` | All Roles | List customers with search, status pipeline & customer type filtering |
| `POST` | `/api/customers` | Admin, Sales | Create a new wholesale customer profile |
| `POST` | `/api/customers/:id/notes` | Admin, Sales | Log CRM follow-up call note & update pipeline schedule |
| `GET` | `/api/products` | All Roles | List products with low stock alert filtering |
| `POST` | `/api/products` | Admin, Warehouse | Create a new product catalog item |
| `POST` | `/api/products/:id/adjust-stock` | Admin, Warehouse | Execute manual Stock IN / OUT adjustment with audit reason |
| `GET` | `/api/products/stock-logs` | All Roles | Audit movement history log of stock changes |
| `GET` | `/api/challans` | All Roles | List sales challans & invoice records |
| `POST` | `/api/challans` | Admin, Sales | Create new Draft or Confirmed Sales Challan |
| `PATCH` | `/api/challans/:id/status` | Admin, Sales | Confirm draft challan & trigger atomic stock reduction |

---

## ⚙️ 5. Setup & Local Development Instructions

### **Prerequisites**:
- Node.js (v18+ or v20+)
- npm or yarn

### **Quick Local Execution**:
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Priyangshu0011/ERP-CRM-Operations-Portal.git
   cd ERP-CRM-Operations-Portal
   ```

2. **Start Backend**:
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run prisma:seed
   npm run dev
   ```
   *Backend running on `http://localhost:5000`*

3. **Start Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Frontend running on `http://localhost:3000`*

---

## 📌 6. Known Limitations & Future Enhancements

1. **Cloud Render Cold-Starts**: The backend is hosted on Render's free tier. If inactive, the first API request may take ~30 seconds to wake up the server instance.
2. **Product Image Storage**: Product images currently utilize HTTPS web URLs. Cloud bucket upload (AWS S3 / Cloudinary) can be configured via environment variables.
3. **Database Scaling**: SQLite is used for lightweight deployment; transitioning to Neon PostgreSQL is supported via `schema.prisma`.
