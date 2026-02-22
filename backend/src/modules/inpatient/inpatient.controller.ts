import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';

const createBedSchema = z.object({
  wardName: z.string(),
  bedNumber: z.string(),
});

const admitPatientSchema = z.object({
  patientId: z.string(),
  bedId: z.string(),
  admissionReason: z.string(),
});

export const createBed = async (req: AuthRequest, res: Response) => {
  try {
    const data = createBedSchema.parse(req.body);
    const { facilityId } = req.user!;

    const bed = await prisma.bed.create({
      data: { ...data, facilityId },
    });

    res.status(201).json(bed);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBeds = async (req: AuthRequest, res: Response) => {
  try {
    const { facilityId } = req.user!;

    const beds = await prisma.bed.findMany({
      where: { facilityId },
      include: {
        admissions: {
          where: { status: 'ACTIVE' },
          include: { patient: true },
        },
      },
      orderBy: [{ wardName: 'asc' }, { bedNumber: 'asc' }],
    });

    res.json(beds);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const admitPatient = async (req: AuthRequest, res: Response) => {
  try {
    const data = admitPatientSchema.parse(req.body);
    const { userId } = req.user!;

    const admission = await prisma.admission.create({
      data: { ...data, admittedBy: userId },
      include: { patient: true, bed: true },
    });

    await prisma.bed.update({
      where: { id: data.bedId },
      data: { status: 'OCCUPIED' },
    });

    res.status(201).json(admission);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdmissions = async (req: AuthRequest, res: Response) => {
  try {
    const { facilityId } = req.user!;

    const admissions = await prisma.admission.findMany({
      where: { bed: { facilityId } },
      include: { patient: true, bed: true },
      orderBy: { admissionDate: 'desc' },
    });

    res.json(admissions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const dischargeSchema = z.object({
  dischargeSummary: z.string(),
});

export const dischargePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = dischargeSchema.parse(req.body);

    const admission = await prisma.admission.update({
      where: { id },
      data: {
        status: 'DISCHARGED',
        dischargeDate: new Date(),
        dischargeSummary: data.dischargeSummary,
      },
      include: { bed: true },
    });

    await prisma.bed.update({
      where: { id: admission.bedId },
      data: { status: 'AVAILABLE' },
    });

    res.json(admission);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
