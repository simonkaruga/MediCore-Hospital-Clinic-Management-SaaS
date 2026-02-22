# MediCore - Hospital Management System

Simple folder structure with separate frontend and backend.

## 📁 Project Structure

```
MediCore-Simple/
├── backend/           # Node.js + Express API
│   ├── src/          # Source code
│   ├── prisma/       # Database schema & migrations
│   └── package.json
├── frontend/         # Next.js React app
│   ├── src/          # Source code
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### 1. Start Backend (API Server)

```bash
cd backend
npm install
npm run dev
```

Backend runs on: http://localhost:3001

### 2. Start Frontend (Web App)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3002

### 3. Login

- Email: `doctor@demo.medicore.co.ke`
- Password: `admin123`

## 🗄️ Database

The backend uses SQLite database located at `backend/prisma/dev.db`

To reset database:
```bash
cd backend
rm -f prisma/dev.db
npx prisma db push
npx tsx prisma/seed.ts
```

## 📋 Features

- ✅ Patient Management
- ✅ Doctor Consultation (EMR)
- ✅ Appointments & Schedule
- ✅ Pharmacy with Inventory
- ✅ Laboratory Results
- ✅ Billing & Invoices
- ✅ Inpatient Management
- ✅ Stock Alerts
- ✅ Discharge Summaries

## 🔧 Tech Stack

**Backend:**
- Node.js + Express
- Prisma ORM
- SQLite Database
- JWT Authentication

**Frontend:**
- Next.js 14
- React
- Tailwind CSS
- Axios

## 📝 API Endpoints

Backend API runs on port 3001:
- POST `/api/auth/login` - Login
- GET `/api/patients` - Get patients
- POST `/api/emr/visits` - Create visit
- GET `/api/pharmacy/prescriptions` - Get prescriptions
- GET `/api/lab/requests` - Get lab requests
- GET `/api/billing/invoices` - Get invoices

## 🎯 Development

**Backend:**
- `npm run dev` - Start with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build

## 📞 Support

For issues or questions, check the FEATURES_ADDED.md file for detailed documentation.
