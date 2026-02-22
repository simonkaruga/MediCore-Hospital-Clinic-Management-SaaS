import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';

const createPatientSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string(),
  email: z.string().optional(),
  nationalId: z.string().optional(),
  address: z.string().optional(),
  nextOfKinName: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
});

export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const data = createPatientSchema.parse(req.body);
    const { tenantId, facilityId } = req.user!;

    const patient = await prisma.patient.create({
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        patientNumber: `P${Date.now()}`,
        tenantId,
        facilityId,
      },
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { search, q } = req.query;
    const searchTerm = search || q;

    const where: any = { tenantId };
    if (searchTerm) {
      where.OR = [
        { firstName: { contains: searchTerm as string } },
        { lastName: { contains: searchTerm as string } },
        { patientNumber: { contains: searchTerm as string } },
        { phone: { contains: searchTerm as string } },
      ];
    }

    const patients = await prisma.patient.findMany({
      where,
      take: searchTerm ? 10 : 50,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: patients });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user!;

    const patient = await prisma.patient.findFirst({
      where: { id, tenantId },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePatient = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
};
