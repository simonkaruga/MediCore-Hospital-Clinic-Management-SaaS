import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';
import { createAuditLog } from '../../utils/audit';

const createVisitSchema = z.object({
  patientId: z.string(),
  visitType: z.enum(['OUTPATIENT', 'EMERGENCY', 'INPATIENT']),
  chiefComplaint: z.string().optional(),
});

const createClinicalNoteSchema = z.object({
  visitId: z.string(),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  notes: z.string().optional(),
});

export const createVisit = async (req: AuthRequest, res: Response) => {
  try {
    const data = createVisitSchema.parse(req.body);
    const { facilityId, tenantId, userId } = req.user!;

    const visitNumber = `V${Date.now()}`;

    const visit = await prisma.patientVisit.create({
      data: {
        ...data,
        visitNumber,
        facilityId,
      },
      include: { patient: true },
    });

    await createAuditLog({
      userId,
      tenantId,
      action: 'CREATE',
      entity: 'VISIT',
      entityId: visit.id,
      changes: data,
    });

    res.status(201).json(visit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createClinicalNote = async (req: AuthRequest, res: Response) => {
  try {
    const data = createClinicalNoteSchema.parse(req.body);
    const { userId, tenantId } = req.user!;

    const note = await prisma.clinicalNote.create({
      data: {
        ...data,
        doctorId: userId,
      },
    });

    await createAuditLog({
      userId,
      tenantId,
      action: 'CREATE',
      entity: 'CLINICAL_NOTE',
      entityId: note.id,
      changes: data,
    });

    res.status(201).json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
