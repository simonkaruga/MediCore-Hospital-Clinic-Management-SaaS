import { Router } from 'express';
import * as emrController from './emr.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantIsolation } from '../../middleware/tenant.middleware';

const router = Router();

router.use(authenticate);
router.use(tenantIsolation);

router.post('/visits', emrController.createVisit);
router.post('/clinical-notes', emrController.createClinicalNote);

export default router;
