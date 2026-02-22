import { Router } from 'express';
import * as labController from './lab.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantIsolation } from '../../middleware/tenant.middleware';

const router = Router();

router.use(authenticate);
router.use(tenantIsolation);

router.get('/requests', labController.getLabRequests);
router.post('/requests', labController.createLabRequest);
router.post('/results', labController.createLabResult);

export default router;
