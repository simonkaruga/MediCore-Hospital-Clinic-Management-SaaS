import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';
import { createAuditLog } from '../../utils/audit';

const createPrescriptionSchema = z.object({
  visitId: z.string(),
  items: z.array(z.object({
    drugName: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
    quantity: z.number(),
    instructions: z.string().optional(),
  })),
  notes: z.string().optional(),
});

export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const { facilityId } = req.user!;
    const { search } = req.query;

    const items = await prisma.inventoryItem.findMany({
      where: {
        facilityId,
        category: 'MEDICATION',
        ...(search && {
          OR: [
            { itemName: { contains: search as string } },
            { genericName: { contains: search as string } },
          ],
        }),
      },
      include: {
        stockLevels: {
          orderBy: { expiryDate: 'asc' },
          take: 1,
        },
      },
      orderBy: { itemName: 'asc' },
    });

    const inventory = items.map(item => ({
      id: item.id,
      name: item.itemName,
      genericName: item.genericName,
      quantity: item.stockLevels[0]?.quantity || 0,
      unit: item.unit,
    }));

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const { facilityId } = req.user!;
    const { status } = req.query;

    const prescriptions = await prisma.prescription.findMany({
      where: {
        visit: { facilityId },
        ...(status && { status: status as string }),
      },
      include: {
        items: true,
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
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const data = createPrescriptionSchema.parse(req.body);
    const { userId, tenantId } = req.user!;

    const prescription = await prisma.prescription.create({
      data: {
        visitId: data.visitId,
        doctorId: userId,
        notes: data.notes,
        items: {
          create: data.items,
        },
      },
      include: { items: true },
    });

    await createAuditLog({
      userId,
      tenantId,
      action: 'CREATE',
      entity: 'PRESCRIPTION',
      entityId: prescription.id,
      changes: data,
    });

    res.status(201).json(prescription);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const dispensePrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, userId } = req.user!;

    const prescription = await prisma.prescription.update({
      where: { id },
      data: { status: 'DISPENSED' },
    });

    await createAuditLog({
      userId,
      tenantId,
      action: 'UPDATE',
      entity: 'PRESCRIPTION',
      entityId: id,
      changes: { status: 'DISPENSED' },
    });

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
