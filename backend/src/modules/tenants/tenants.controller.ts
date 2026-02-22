import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';

const createTenantSchema = z.object({
  name: z.string(),
  subdomain: z.string(),
  isGroup: z.boolean().default(false),
  plan: z.enum(['BASIC', 'PRO', 'ENTERPRISE']).default('BASIC'),
});

const createFacilitySchema = z.object({
  tenantId: z.string(),
  name: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const createTenant = async (req: Request, res: Response) => {
  try {
    const data = createTenantSchema.parse(req.body);

    const tenant = await prisma.tenant.create({
      data,
    });

    res.status(201).json(tenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createFacility = async (req: Request, res: Response) => {
  try {
    const data = createFacilitySchema.parse(req.body);

    const facility = await prisma.facility.create({
      data,
    });

    res.status(201).json(facility);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
