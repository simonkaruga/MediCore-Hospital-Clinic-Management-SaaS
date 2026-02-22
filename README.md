# MediCore - Hospital Management System

Complete hospital management system with patient records, EMR, pharmacy, lab, billing, and analytics.

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

### Option 1: Auto-Start (Recommended)

```bash
./start-all.sh
```

This will start both backend and frontend automatically.

### Option 2: Manual Start

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:3002

### 3. Login

- Email: `doctor@demo.medicore.co.ke`
- Password: `admin123`

## 🗄️ Database

SQLite database at `backend/prisma/dev.db`

Reset database:
```bash
cd backend
rm -f prisma/dev.db
npx prisma db push
npx tsx prisma/seed.ts
```

## 📋 Features

### ✅ Core Modules
- **Patient Management** - Register, search, view, edit patients
- **EMR (Electronic Medical Records)** - Doctor consultations with SOAP notes
- **Appointments & Schedule** - Book and manage appointments
- **Pharmacy** - Prescriptions, dispensing, inventory management
- **Laboratory** - Lab requests and results entry
- **Billing & Invoices** - Generate invoices, track payments
- **Inpatient Management** - Bed management, admissions, discharge summaries
- **Analytics Dashboard** - Revenue, appointments, department stats

### 🆕 New Features
- **Patient Edit** - Update patient information
- **Print Prescriptions** - Print-ready prescription format
- **Print Invoices** - Professional invoice printing
- **Stock Alerts** - Low stock and out-of-stock warnings
- **Error Handling** - Better error boundaries and messages
- **Auto-Start Script** - One command to start everything
- **SMS Notifications** - Ready for Africa's Talking integration
- **M-Pesa Integration** - Payment processing (needs credentials)

## 🔧 Tech Stack

**Backend:**
- Node.js + Express
- Prisma ORM
- SQLite Database
- JWT Authentication
- Zod Validation

**Frontend:**
- Next.js 14
- React
- Tailwind CSS
- Axios

## 📝 API Endpoints

- `POST /api/auth/login` - Login
- `GET /api/patients` - Get patients
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `POST /api/patients` - Create patient
- `POST /api/emr/visits` - Create visit
- `GET /api/pharmacy/prescriptions` - Get prescriptions
- `GET /api/lab/requests` - Get lab requests
- `GET /api/billing/invoices` - Get invoices
- `GET /api/analytics/dashboard` - Get analytics

## 🎯 Development

**Backend:**
- `npm run dev` - Start with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build

## 🔐 Environment Variables

**Backend (.env):**
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3001

# Optional: SMS Service
AFRICASTALKING_API_KEY=""
AFRICASTALKING_USERNAME="sandbox"

# Optional: M-Pesa
MPESA_CONSUMER_KEY=""
MPESA_CONSUMER_SECRET=""
MPESA_SHORTCODE=""
MPESA_PASSKEY=""
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📊 Complete Workflow

1. **Login** as doctor
2. **View Schedule** - See today's appointments
3. **Patient Search** - Find or register patient
4. **Consultation** - Record vitals, SOAP notes, diagnosis
5. **Prescribe** - Select from inventory with stock levels
6. **Lab Orders** - Request lab tests
7. **Pharmacy** - Dispense medications, print prescriptions
8. **Lab** - Enter test results
9. **Billing** - Generate and print invoices
10. **Analytics** - View hospital performance metrics

## 🖨️ Printing

- **Prescriptions**: Click "Print" in Pharmacy module
- **Invoices**: Click "Print Invoice" in Billing module
- Uses browser's native print dialog

## 📱 SMS Notifications (Optional)

Configure Africa's Talking API:
1. Sign up at https://africastalking.com
2. Add API key to backend `.env`
3. Notifications will be sent for:
   - Appointment reminders
   - Lab results ready
   - Prescription ready for pickup

## 💳 M-Pesa Integration (Optional)

Configure M-Pesa credentials in backend `.env` for:
- STK Push payments
- Payment verification
- Automatic invoice updates

## 📞 Support

For issues or questions, check the FEATURES_ADDED.md file for detailed documentation.

## 🚀 Production Deployment

1. Switch to PostgreSQL database
2. Set production environment variables
3. Configure SMS and M-Pesa credentials
4. Enable HTTPS
5. Set up proper backup strategy

## 📄 License

MIT License - Free to use and modify
