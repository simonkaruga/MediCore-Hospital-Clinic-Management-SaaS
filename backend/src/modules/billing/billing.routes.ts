import { Router } from 'express';
import * as billingController from './billing.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantIsolation } from '../../middleware/tenant.middleware';

const router = Router();

router.use(authenticate);
router.use(tenantIsolation);

router.get('/invoices', billingController.getInvoices);
router.post('/invoices', billingController.createInvoice);
router.post('/payments', billingController.createPayment);

export default router;
