import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';

const addToQueueSchema = z.object({
  patientId: z.string(),
  departmentId: z.string(),
  priority: z.number().default(0),
  triageLevel: z.enum(['RED', 'ORANGE', 'YELLOW', 'GREEN']).optional(),
});

export const addToQueue = async (req: AuthRequest, res: Response) => {
  try {
    const data = addToQueueSchema.parse(req.body);
    const queueEntry = await prisma.queueEntry.create({ data });
    res.status(201).json(queueEntry);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { departmentId } = req.query;
    const { departments } = req.user!;

    const queue = await prisma.queueEntry.findMany({
      where: {
        departmentId: departmentId as string || { in: departments },
        status: 'WAITING',
      },
      orderBy: [{ priority: 'desc' }, { joinedAt: 'asc' }],
    });

    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const callNext = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const queueEntry = await prisma.queueEntry.update({
      where: { id },
      data: { status: 'IN_PROGRESS', calledAt: new Date() },
    });
    res.json(queueEntry);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const completeQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const queueEntry = await prisma.queueEntry.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    res.json(queueEntry);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
