# NexusERP | Mini ERP + CRM Operations Portal

> **Full Stack Developer Case Study Solution**  
> **GitHub Repository**: [https://github.com/Priyangshu0011/ERP-CRM-Operations-Portal](https://github.com/Priyangshu0011/ERP-CRM-Operations-Portal)  
> An enterprise-grade, responsive Mini ERP & CRM Operations System tailored for wholesale and distribution businesses. Featuring Role-Based Access Control (RBAC), CRM Lead Management, Stock Inventory Movement Logs, and Sales Challans with **atomic inventory deduction** and **historical product snapshotting**.

---

## 🔑 Test Login Credentials (All 4 Roles)

Password for all pre-seeded accounts is **`password123`**:

| Role | Email | Privileges & Access Scope |
|---|---|---|
| 👑 **Admin** | `admin@erp.com` | Full system access: User management, CRM, Inventory, Challans & Financials |
| 💼 **Sales** | `sales@erp.com` | Add/Edit Customers, Log Follow-ups, Create & Confirm Sales Challans |
| 📦 **Warehouse** | `warehouse@erp.com` | Manage Product Catalog, Stock IN/OUT Adjustments, View Stock Logs |
| 💳 **Accounts** | `accounts@erp.com` | View Sales Orders & Invoices, Customer Billing Data, Print Tax Invoices |

*Note: The frontend UI features a **"Quick Role Evaluator"** top banner allowing instant 1-click evaluation between roles without re-typing passwords.*

---

## 🚀 Key Features & Business Logic Implementation

### 1. 🛡️ Authentication & Role-Based Access Control (RBAC)
- **JWT (JSON Web Token)** based security with bcrypt password hashing.
- Role enforcement at both API level (Express middleware `requireRole(['ADMIN', 'SALES'])`) and UI level (conditional actions and buttons).

### 2. 📇 Customer CRM Module
- Complete Customer profiles storing: Customer Name, Business Name, Mobile, Email, GST Number, Type (`Retail`, `Wholesale`, `Distributor`), Address, Status (`Lead`, `Active`, `Inactive`), Next Follow-up Date, and Notes.
- **Search & Multi-Filter**: Filter by search query, status pill, or customer type.
- **Customer Detail Drawer**: Full CRM drawer displaying activity timeline, previous orders, and an **interactive Follow-Up Note Composer** to record sales calls and update follow-up schedules.

### 3. 📦 Product & Inventory Module
- Stores: Product Name, Unique SKU, Category, Unit Price, Current Stock, Minimum Stock Alert Qty, Warehouse Location, and Image URL.
- **Low Stock Visual Badges**: Automatic visual alerts when `currentStock <= minStockAlert`.
- **Stock Movement Log**: Audit log tracking all inventory changes with Movement Type (`IN` / `OUT`), Quantity Changed, Reason, Author, and Timestamp.
- **Manual Stock Adjuster**: Instant stock deposit/issue modal with mandatory audit reason logging.

### 4. 🧾 Sales Challan Module & Business Rules
- **Automatic Challan Numbering**: Auto-generated sequential format (`CH-YYYYMMDD-XXXX`).
- **Draft vs. Confirmed Flow**: Sales users can draft sales orders or directly confirm them.
- **Atomic Stock Reduction**: When a Challan status changes to `Confirmed`, stock is reduced inside a database transaction (`prisma.$transaction`).
- **Negative Stock Prevention**: Stock **never** goes negative. If stock is insufficient, the API rejects the request with HTTP `400 Bad Request` and detailed line-item breakdown.
- **Historical Product Snapshot**: Challans store `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot` so future product updates/deletions never alter past invoice amounts.
- **Printable Tax Invoice / PDF Export**: Built-in professional Tax Invoice generator with browser print/PDF export capability.

---

## 🛠️ Architecture & System Structure

```
mini-erp-crm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma ORM Database Models
│   │   └── seed.ts            # Database seed script for test accounts & sample data
│   ├── src/
│   │   ├── controllers/       # Auth, Customer, Product, Challan API controllers
│   │   ├── middleware/        # JWT Auth, RBAC & Zod Central Error Handler
│   │   ├── routes/            # Express REST API routes
│   │   └── index.ts           # Server entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Dashboard, CRM, Inventory, Challans, Navbar, Sidebar
│   │   ├── context/           # AuthContext with 1-click Quick Role Switcher
│   │   ├── services/          # Axios API Client
│   │   ├── types/             # TypeScript Interfaces
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── .github/workflows/ci.yml   # GitHub Actions CI build & test pipeline
├── docker-compose.yml         # Unified Docker Compose setup
├── postman_collection.json    # Ready-to-import Postman Collection
└── README.md
```

---

## 💻 How to Run Locally

### Prerequisites
- Node.js (v18 or v20+)
- npm or yarn

### ⚡ Quick Start (Zero Config SQLite)

1. **Clone repository and enter root directory**:
   ```bash
   cd mini-erp-crm
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

## 🐳 Docker Deployment (Optional)

Run the full stack (Postgres + Express Backend + React Frontend) with a single command:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Postgres DB: `localhost:5432`

---

## 📮 API Documentation & Postman Collection

Import `postman_collection.json` into Postman to test all endpoints.

### Key REST Endpoints

| Method | Endpoint | Access Role | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT token |
| `GET` | `/api/auth/me` | Authenticated | Get currently logged-in user profile |
| `GET` | `/api/customers` | All Roles | List customers with search, status, & type filters |
| `POST` | `/api/customers` | Admin, Sales | Create a new Customer profile |
| `POST` | `/api/customers/:id/notes` | Admin, Sales, Accounts | Add CRM follow-up note & update follow-up date |
| `GET` | `/api/products` | All Roles | List products with low stock filter |
| `POST` | `/api/products/:id/adjust-stock` | Admin, Warehouse | Perform manual Stock IN / OUT adjustment |
| `GET` | `/api/products/stock-logs` | All Roles | Audit log of all stock movements |
| `GET` | `/api/challans` | All Roles | List sales challans |
| `POST` | `/api/challans` | Admin, Sales | Create Draft or Confirmed Sales Challan |
| `PATCH` | `/api/challans/:id/status` | All Roles | Confirm draft challan (triggers stock reduction) |

---

## 🌐 Step-by-Step Deployment Guide (Vercel + Render)

### 1. Deploy Backend on Render (Free Web Service)
1. Log in to [Render.com](https://render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository (`Priyangshu0011/ERP-CRM-Operations-Portal`).
3. Configure the following settings:
   - **Name**: `mini-erp-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma db push && npm run prisma:seed && npm start`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `supersecret_jwt_key_erp_crm_2026`
   - `DATABASE_URL`: `file:./dev.db` *(or your Neon PostgreSQL URL)*
5. Click **Create Web Service**. Render will build and deploy your API (e.g. `https://mini-erp-backend.onrender.com`).

---

### 2. Deploy Frontend on Vercel (Free Static Hosting)
1. Log in to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import repository `Priyangshu0011/ERP-CRM-Operations-Portal`.
3. Configure project settings:
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - **`VITE_API_URL`**: `https://mini-erp-backend.onrender.com/api` *(Your Render backend URL + `/api`)*
5. Click **Deploy**. Vercel will build and publish your live frontend URL!

---

## 📌 Assumptions & Known Limitations

1. **Local SQLite vs PostgreSQL**: For zero-setup local evaluation, SQLite is configured by default. For production/Docker, PostgreSQL is configured via `schema.prisma` datasource provider.
2. **Product Images**: Product image URLs are supported via direct HTTPS links. S3 integration can be enabled by specifying S3 credentials in environment variables.
