import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';
import { createAuditLog } from '../../utils/audit';

const createLabRequestSchema = z.object({
  visitId: z.string(),
  testName: z.string(),
  testCode: z.string().optional(),
  urgency: z.enum(['ROUTINE', 'URGENT', 'STAT']).default('ROUTINE'),
  notes: z.string().optional(),
});

const createLabResultSchema = z.object({
  requestId: z.string(),
  result: z.string(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  isCritical: z.boolean().default(false),
});

export const getLabRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { facilityId } = req.user!;
    const { status } = req.query;

    const requests = await prisma.labRequest.findMany({
      where: {
        visit: { facilityId },
        ...(status && { status: status as string }),
      },
      include: {
        visit: {
          include: {
            patient: true,
          },
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        results: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createLabRequest = async (req: AuthRequest, res: Response) => {
  try {
    const data = createLabRequestSchema.parse(req.body);
    const { userId, tenantId } = req.user!;

    const request = await prisma.labRequest.create({
      data: {
        ...data,
        requestedBy: userId,
      },
    });

    await createAuditLog({
      userId,
      tenantId,
      action: 'CREATE',
      entity: 'LAB_REQUEST',
      entityId: request.id,
      changes: data,
    });

    res.status(201).json(request);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createLabResult = async (req: AuthRequest, res: Response) => {
  try {
    const data = createLabResultSchema.parse(req.body);
    const { userId, tenantId } = req.user!;

    const result = await prisma.labResult.create({
      data: {
        ...data,
        performedBy: userId,
      },
    });

    await prisma.labRequest.update({
      where: { id: data.requestId },
      data: { status: 'COMPLETED' },
    });

    await createAuditLog({
      userId,
      tenantId,
      action: 'CREATE',
      entity: 'LAB_RESULT',
      entityId: result.id,
      changes: data,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
