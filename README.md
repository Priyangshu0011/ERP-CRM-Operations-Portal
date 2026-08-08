# NexusERP - Mini ERP and CRM Operations Portal

Full Stack Case Study Solution

- GitHub Repository: https://github.com/Priyangshu0011/ERP-CRM-Operations-Portal
- Live Frontend Portal: https://erp-crm-operations-portal-pi.vercel.app
- Live Backend REST API: https://mini-erp-backend-sb2u.onrender.com

---

Documentation Index

1. Project Links and Credentials: PROJECT_LINKS_AND_CREDENTIALS.md
2. Server Setup and Environment Variables: SERVER_SETUP_AND_ENV_VARS.md
3. Local Setup and Deployment Guide: SETUP_AND_DEPLOYMENT.md
4. System Architecture: SYSTEM_ARCHITECTURE.md
5. Assumptions Made and Known Limitations: ASSUMPTIONS_AND_LIMITATIONS.md
6. API Documentation: API_DOCUMENTATION.md

---

Test Login Credentials

All test accounts share the same password: password123

- Admin: admin@erp.com (Full system access across CRM, inventory, sales orders and financial auditing)
- Sales: sales@erp.com (Customer management, CRM follow-up logging and sales order creation)
- Warehouse: warehouse@erp.com (Product catalog management, manual stock IN/OUT adjustments and inventory movement logs)
- Accounts: accounts@erp.com (Financial auditing for sales orders, customer billing data and tax invoice generation)

---

Server Setup Summary

The backend server is developed using Node.js, Express and TypeScript. Authentication is managed using JSON Web Tokens (JWT) and passwords are encrypted using bcrypt hashing. Database operations use Prisma ORM with SQLite for straightforward local execution.

---

Environment Variables Management Summary

Backend Environment Variables (backend/.env):
- PORT: 5000
- NODE_ENV: development or production
- JWT_SECRET: secret key for signing tokens
- DATABASE_URL: connection string (file:./dev.db)

Frontend Environment Variables (frontend/.env):
- VITE_API_URL: http://localhost:5000/api in development and https://mini-erp-backend-sb2u.onrender.com/api in production.

---

Quick Local Run Instructions

1. Clone repository:
   git clone https://github.com/Priyangshu0011/ERP-CRM-Operations-Portal.git
   cd ERP-CRM-Operations-Portal

2. Start backend:
   cd backend
   npm install
   npx prisma db push
   npm run prisma:seed
   npm run dev

3. Start frontend in a separate terminal:
   cd frontend
   npm install
   npm run dev

4. Open http://localhost:3000 in your browser.
