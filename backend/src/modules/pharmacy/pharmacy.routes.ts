import { Router } from 'express';
import * as pharmacyController from './pharmacy.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantIsolation } from '../../middleware/tenant.middleware';

const router = Router();

router.use(authenticate);
router.use(tenantIsolation);

router.get('/inventory', pharmacyController.getInventory);
router.get('/prescriptions', pharmacyController.getPrescriptions);
router.post('/prescriptions', pharmacyController.createPrescription);
router.patch('/prescriptions/:id/dispense', pharmacyController.dispensePrescription);

export default router;
