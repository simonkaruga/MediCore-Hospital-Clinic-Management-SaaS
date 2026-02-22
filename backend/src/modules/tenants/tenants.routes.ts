import { Router } from 'express';
import * as tenantsController from './tenants.controller';

const router = Router();

router.post('/tenants', tenantsController.createTenant);
router.post('/facilities', tenantsController.createFacility);

export default router;
