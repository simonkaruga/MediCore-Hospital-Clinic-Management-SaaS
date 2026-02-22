import { Router } from 'express';
import * as inpatientController from './inpatient.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantIsolation } from '../../middleware/tenant.middleware';

const router = Router();

router.use(authenticate);
router.use(tenantIsolation);

router.post('/beds', inpatientController.createBed);
router.get('/beds', inpatientController.getBeds);
router.post('/admissions', inpatientController.admitPatient);
router.get('/admissions', inpatientController.getAdmissions);
router.patch('/admissions/:id/discharge', inpatientController.dischargePatient);

export default router;
