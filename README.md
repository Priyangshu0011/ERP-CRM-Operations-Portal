# NexusERP | Mini ERP + CRM Operations Portal

> **Full Stack Developer Case Study Solution**  
> **GitHub Repository**: [https://github.com/Priyangshu0011/ERP-CRM-Operations-Portal](https://github.com/Priyangshu0011/ERP-CRM-Operations-Portal)  
> **Live Frontend Portal**: [https://erp-crm-operations-portal-pi.vercel.app](https://erp-crm-operations-portal-pi.vercel.app)  
> **Live Backend REST API**: [https://mini-erp-backend-sb2u.onrender.com](https://mini-erp-backend-sb2u.onrender.com)  

An enterprise-grade, responsive Mini ERP and CRM Operations System tailored for wholesale and distribution enterprises. Featuring Role-Based Access Control (RBAC) across four distinct roles, CRM Lead Management, Stock Inventory Movement Logs and Sales Challans with **atomic inventory deduction** and **historical product snapshotting**.

---

## 🔑 Test Login Credentials (All 4 Roles)

Password for all pre-seeded accounts is **`password123`**:

| Role | Email | Privileges and Access Scope |
|---|---|---|
| 👑 **Admin** | `admin@erp.com` | Full system access: User management, CRM, Inventory, Challans and Financials |
| 💼 **Sales** | `sales@erp.com` | Add/Edit Customers, Log Follow-ups, Create and Confirm Sales Challans |
| 📦 **Warehouse** | `warehouse@erp.com` | Manage Product Catalog, Stock IN/OUT Adjustments and View Stock Logs |
| 💳 **Accounts** | `accounts@erp.com` | View Sales Orders and Invoices, Customer Billing Data and Print Tax Invoices |

*Note: The frontend UI features a **"Quick Role Evaluator"** top banner allowing instant 1-click evaluation between roles without re-typing passwords.*

---

## 🛠️ How the Server Was Set Up

The backend server is developed using Node.js, Express and TypeScript:

1. **Application Entry Point**:
   - `backend/src/index.ts` initializes the Express application, configures CORS headers and registers middleware for JSON request parsing.
   - Modular routers handle endpoint routing for `/api/auth`, `/api/customers`, `/api/products` and `/api/challans`.

2. **Authentication and Security**:
   - Authentication relies on JSON Web Tokens (JWT) with passwords encrypted via `bcryptjs`.
   - Custom middleware `authenticateJWT` decodes incoming Bearer tokens and attaches the verified user payload to `req.user`.
   - Middleware `requireRole(['ADMIN', 'SALES'])` blocks unauthorized role access at the endpoint boundary with HTTP 403 status responses.

3. **Database Layer (Prisma ORM)**:
   - Configured in `backend/prisma/schema.prisma` using SQLite (`file:./dev.db`) for lightweight zero-configuration execution, with support for PostgreSQL.
   - Models include `User`, `Customer`, `CustomerNote`, `Product`, `StockLog`, `SalesChallan` and `ChallanItem`.

4. **Automated Seeding Script**:
   - `backend/prisma/seed.ts` populates initial test accounts across all four enterprise roles, sample customer accounts, stock items and sales orders upon deployment startup.

---

## 🔐 How Environment Variables Are Managed

Environment settings are isolated between backend, frontend, automated testing pipelines and cloud deployment platforms:

### Backend Environment Variables (`backend/.env`)
- `PORT`: Port number for the Express server (default `5000`).
- `NODE_ENV`: Application environment (`development` or `production`).
- `JWT_SECRET`: Secret key used for signing and verifying tokens.
- `DATABASE_URL`: Connection string for Prisma ORM (`file:./dev.db`).

### Frontend Environment Variables (`frontend/.env`)
- `VITE_API_URL`: Base URL for API requests (`http://localhost:5000/api` in development and `https://mini-erp-backend-sb2u.onrender.com/api` in production).

### Automated CI/CD and Cloud Configuration
In GitHub Actions (`.github/workflows/ci.yml`), environment variables (`DATABASE_URL` and `JWT_SECRET`) are supplied during automated build checks. In cloud hosting, environment variables are set directly in the Render and Vercel management dashboards.

---

## 💻 How to Run the Project Locally

### Prerequisites
- Node.js (version 18 or 20)
- npm package manager

### Steps to Run Locally

1. **Clone the repository**:
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

## 🌐 How to Deploy the Project

### Backend Deployment (Render)
1. Create a **Web Service** on [Render.com](https://render.com) connected to repository `Priyangshu0011/ERP-CRM-Operations-Portal`.
2. Configure build parameters:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma db push && npm run prisma:seed && npm start`
3. Configure environment variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `supersecret_jwt_key_erp_crm_2026`
   - `DATABASE_URL`: `file:./dev.db`

### Frontend Deployment (Vercel)
1. Create a project on [Vercel.com](https://vercel.com) connected to repository `Priyangshu0011/ERP-CRM-Operations-Portal`.
2. Configure build parameters:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Configure environment variable:
   - `VITE_API_URL`: `https://mini-erp-backend-sb2u.onrender.com/api`

---

## 🏛️ Architecture Overview

The system implements a decoupled client-server architecture:

- **Frontend (React + Vite + TypeScript)**: Responsive client dashboard built with Tailwind CSS, lucide icons, reactive role-filtered sidebars and dynamic component rendering.
- **Backend (Node.js + Express + TypeScript)**: RESTful API protected by JWT bearer authentication and role enforcement middleware (`requireRole`).
- **Database & Data Integrity (Prisma ORM)**: Type-safe database queries.
  - **Atomic Stock Deduction**: Order confirmation runs within an atomic database transaction (`prisma.$transaction`). Stock levels are verified prior to deduction to prevent negative inventory values.
  - **Historical Product Snapshots**: Line items in sales challans store snapshots of product names, SKUs and unit prices (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`). This ensures past invoices remain accurate even if catalog items are modified or removed.

---

## 📌 Assumptions Made and Known Limitations

### Assumptions Made
1. **SQLite Database Choice**: SQLite is used as the default database engine to allow zero-configuration execution during local evaluation.
2. **Pre-configured Credentials**: Accounts are pre-seeded for all four roles to enable immediate evaluation without manual registration.
3. **Single Currency Standard**: All monetary figures are assumed to be in Indian Rupees (INR).
4. **Stock Deduction Timing**: Stock is deducted strictly when a sales order is changed to `Confirmed` status. Draft orders do not deduct inventory.

### Known Limitations
1. **Hosting Server Warmup**: The backend is hosted on a free Render instance which goes idle after periods of inactivity. Initial requests may take roughly 30 seconds to respond.
2. **Product Image Hosting**: Product images use direct HTTPS web links rather than cloud storage bucket uploads.

---

## 📮 REST API Endpoint Documentation

Import `postman_collection.json` into Postman to test all endpoints.

### Key Endpoints Overview

| Method | Endpoint | Access Scope | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate email and password, returning a JWT bearer token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile details for the authenticated user |
| `GET` | `/api/customers` | All Roles | List customer accounts with support for search and status filters |
| `POST` | `/api/customers` | Admin, Sales | Create a new customer profile |
| `POST` | `/api/customers/:id/notes` | Admin, Sales | Add a follow-up note and update customer pipeline status |
| `GET` | `/api/products` | All Roles | Retrieve product catalog with low stock filter |
| `POST` | `/api/products` | Admin, Warehouse | Add a new product to the catalog |
| `POST` | `/api/products/:id/adjust-stock` | Admin, Warehouse | Record manual stock IN or OUT adjustments with reason logging |
| `GET` | `/api/products/stock-logs` | All Roles | Retrieve historical inventory movement audit logs |
| `GET` | `/api/challans` | All Roles | List sales orders and invoices |
| `POST` | `/api/challans` | Admin, Sales | Create a draft or confirmed sales order |
| `PATCH` | `/api/challans/:id/status` | Admin, Sales | Update sales order status to Confirmed or Cancelled |
