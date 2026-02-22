import { Router } from 'express';
import * as patientsController from './patients.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', patientsController.createPatient);
router.get('/', patientsController.getPatients);
router.get('/:id', patientsController.getPatient);
router.put('/:id', patientsController.updatePatient);

export default router;
