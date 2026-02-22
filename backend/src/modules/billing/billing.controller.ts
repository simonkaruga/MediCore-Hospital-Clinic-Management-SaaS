import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';
import { createAuditLog } from '../../utils/audit';

const createInvoiceSchema = z.object({
  visitId: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
  })),
});

const createPaymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number(),
  method: z.enum(['CASH', 'MPESA', 'INSURANCE_SHA', 'INSURANCE_PRIVATE', 'CORPORATE']),
  transactionRef: z.string().optional(),
});

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const { facilityId } = req.user!;
    const { status } = req.query;

    const invoices = await prisma.invoice.findMany({
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
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const data = createInvoiceSchema.parse(req.body);
    const { tenantId, userId } = req.user!;

    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const invoiceNumber = `INV${Date.now()}`;

    const invoice = await prisma.invoice.create({
      data: {
        visitId: data.visitId,
        invoiceNumber,
        totalAmount,
        items: {
          create: data.items.map(item => ({
            ...item,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    await createAuditLog({
      userId,
      tenantId,
      action: 'CREATE',
      entity: 'INVOICE',
      entityId: invoice.id,
      changes: data,
    });

    res.status(201).json(invoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const data = createPaymentSchema.parse(req.body);
    const { tenantId, userId } = req.user!;

    const payment = await prisma.payment.create({
      data,
    });

    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { payments: true },
    });

    if (invoice) {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      const status = totalPaid >= invoice.totalAmount ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : 'PENDING';

      await prisma.invoice.update({
        where: { id: data.invoiceId },
        data: { paidAmount: totalPaid, status },
      });
    }

    await createAuditLog({
      userId,
      tenantId,
      action: 'CREATE',
      entity: 'PAYMENT',
      entityId: payment.id,
      changes: data,
    });

    res.status(201).json(payment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
