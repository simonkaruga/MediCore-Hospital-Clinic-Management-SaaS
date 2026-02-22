import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';

export const createAppointment = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.user!;
    const { doctorId, date } = req.query;

    const where: any = {};
    if (doctorId) where.doctorId = doctorId;
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      where.appointmentDate = { gte: startDate, lt: endDate };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: { select: { firstName: true, lastName: true } },
        department: true,
      },
      orderBy: { appointmentDate: 'asc' },
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
};
