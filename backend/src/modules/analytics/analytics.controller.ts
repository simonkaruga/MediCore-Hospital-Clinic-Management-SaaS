import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId, facilityId } = req.user!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalPatients, todayAppointments, pendingLabs, todayRevenue] = await Promise.all([
      prisma.patient.count({ where: { tenantId } }),
      prisma.appointment.count({
        where: { appointmentDate: { gte: today } },
      }),
      prisma.labRequest.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({
        where: { paidAt: { gte: today } },
        _sum: { amount: true },
      }),
    ]);

    res.json({
      totalPatients,
      todayAppointments,
      pendingLabs,
      todayRevenue: todayRevenue._sum.amount || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
