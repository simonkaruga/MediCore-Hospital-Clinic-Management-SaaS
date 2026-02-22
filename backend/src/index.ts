import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import patientsRoutes from './modules/patients/patients.routes';
import appointmentsRoutes from './modules/appointments/appointments.routes';
import emrRoutes from './modules/emr/emr.routes';
import labRoutes from './modules/lab/lab.routes';
import pharmacyRoutes from './modules/pharmacy/pharmacy.routes';
import billingRoutes from './modules/billing/billing.routes';
import tenantsRoutes from './modules/tenants/tenants.routes';
import queueRoutes from './modules/queue/queue.routes';
import inpatientRoutes from './modules/inpatient/inpatient.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/emr', emrRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/inpatient', inpatientRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🏥 MediCore API running on port ${PORT}`);
});
