import { Router } from 'express';
import * as queueController from './queue.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantIsolation } from '../../middleware/tenant.middleware';

const router = Router();

router.use(authenticate);
router.use(tenantIsolation);

router.post('/', queueController.addToQueue);
router.get('/', queueController.getQueue);
router.patch('/:id/call', queueController.callNext);
router.patch('/:id/complete', queueController.completeQueue);

export default router;
