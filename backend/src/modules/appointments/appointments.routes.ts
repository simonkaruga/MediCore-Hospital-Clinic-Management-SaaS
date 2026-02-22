import { Router } from 'express';
import * as appointmentsController from './appointments.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', appointmentsController.createAppointment);
router.get('/', appointmentsController.getAppointments);
router.patch('/:id/status', appointmentsController.updateAppointmentStatus);

export default router;
