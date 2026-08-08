# 🚀 NexusERP | Mini ERP + CRM Operations Portal

> **Full Stack Enterprise Case Study Solution**  
> **GitHub Repository**: [https://github.com/Priyangshu0011/ERP-CRM-Operations-Portal](https://github.com/Priyangshu0011/ERP-CRM-Operations-Portal)  
> **Live Frontend Portal**: [https://erp-crm-operations-portal-pi.vercel.app](https://erp-crm-operations-portal-pi.vercel.app)  
> **Live Backend API**: [https://mini-erp-backend-sb2u.onrender.com](https://mini-erp-backend-sb2u.onrender.com)  

An enterprise-grade, responsive Mini ERP & CRM Operations System tailored for wholesale and distribution businesses. Featuring strict **Role-Based Access Control (RBAC)** across 4 distinct role scopes, CRM Lead Management & Activity Pipelines, Stock Inventory Movement Logs, and Sales Challans with **atomic inventory deduction** and **historical product snapshotting**.

---

## 🔑 Test Login Credentials (All 4 Pre-seeded Roles)

Password for all pre-seeded accounts is **`password123`**:

| Role | Email Account | Operational Access Scope & Privileges |
|---|---|---|
| 👑 **ADMIN** | `admin@erp.com` | Full System Authority: User Management, CRM, Inventory, Sales Orders, Financial Challans & Audit Logs |
| 💼 **SALES** | `sales@erp.com` | Wholesale CRM & Sales Desk: Add/Edit Customers, Log Sales Follow-up Notes, Create & Confirm Sales Challans |
| 📦 **WAREHOUSE** | `warehouse@erp.com` | Inventory Control: Manage Product Catalog, Stock IN / OUT Adjustments, Reorder Alert Thresholds, Stock Audit History |
| 💳 **ACCOUNTS** | `accounts@erp.com` | Financial Audit & Invoicing: View Sales Orders, Customer Billing Summaries, Tax Invoice Preview & PDF Printing |

---

## 🏛️ Architecture Overview

The system is designed with a **decoupled, scalable client-server architecture**:

- **Frontend (React + Vite + TypeScript)**: Responsive client dashboard built with Tailwind CSS, lucide icons, reactive role-filtered sidebars, and dynamic component rendering.
- **Backend (Node.js + Express + TypeScript)**: RESTful API protected by JWT bearer authentication and role enforcement middleware (`requireRole`).
- **Database & ORM (Prisma ORM + SQLite / PostgreSQL)**: Type-safe database queries.
  - **Atomic Transactions**: Stock deduction on sales order confirmation is wrapped in `prisma.$transaction` to guarantee zero race conditions and negative stock prevention.
  - **Product Snapshotting**: Challan line items store `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot` to ensure historical financial accuracy.

---

## 📮 API Documentation & Postman Collection

Import `NexusERP_API_Postman_Collection.json` into Postman to test all endpoints.

### Key REST Endpoints

| Method | Endpoint | Authorized Scope | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate credentials and receive JWT bearer token |
| `GET` | `/api/auth/me` | All Roles | Retrieve authenticated user profile |
| `GET` | `/api/customers` | All Roles | List customers with search, status pipeline & type filters |
| `POST` | `/api/customers` | Admin, Sales | Create a new Customer profile |
| `POST` | `/api/customers/:id/notes` | Admin, Sales | Add CRM follow-up call note & update pipeline status |
| `GET` | `/api/products` | All Roles | List product catalog with low stock filter |
| `POST` | `/api/products` | Admin, Warehouse | Create a new product catalog item |
| `POST` | `/api/products/:id/adjust-stock` | Admin, Warehouse | Perform manual Stock IN / OUT movement adjustment |
| `GET` | `/api/products/stock-logs` | All Roles | Audit log of all stock movements |
| `GET` | `/api/challans` | All Roles | List sales challans & invoice records |
| `POST` | `/api/challans` | Admin, Sales | Create Draft or Confirmed Sales Challan |
| `PATCH` | `/api/challans/:id/status` | Admin, Sales | Confirm draft challan (triggers atomic stock reduction) |

---

## 💻 How to Run Locally

### Prerequisites
- Node.js (v18 or v20+)
- npm or yarn

### ⚡ Quick Start (Zero Config)

1. **Clone repository and enter project directory**:
   ```bash
   git clone https://github.com/Priyangshu0011/ERP-CRM-Operations-Portal.git
   cd ERP-CRM-Operations-Portal
   ```

2. **Setup and Start Backend**:
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run prisma:seed
   npm run dev
   ```
   *Backend server will start on `http://localhost:5000`.*

3. **Setup and Start Frontend** (In a separate terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Frontend portal will open on `http://localhost:3000`.*

---

## 🌐 Deployment Instructions (Render + Vercel)

### 1. Deploy Backend on Render
1. Connect GitHub repo `Priyangshu0011/ERP-CRM-Operations-Portal` on Render.com.
2. Set Root Directory to `backend`.
3. Set Build Command to: `npm install && npx prisma generate && npm run build`
4. Set Start Command to: `npx prisma db push && npm run prisma:seed && npm start`
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `supersecret_jwt_key_erp_crm_2026`
   - `DATABASE_URL`: `file:./dev.db`

### 2. Deploy Frontend on Vercel
1. Import repository on Vercel.com.
2. Set Root Directory to `frontend`.
3. Framework Preset: `Vite`.
4. Configure Environment Variable:
   - `VITE_API_URL`: `https://mini-erp-backend-sb2u.onrender.com/api`

---

## 📌 Known Limitations

1. **Render Free Tier Warmup**: Render backend instances spin down after inactivity; initial request may take ~30s to wake up.
2. **Product Image Hosting**: Product images use direct HTTPS web URLs. Cloud bucket storage (AWS S3) can be enabled via standard S3 credentials.
