"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = exports.createInvoice = exports.getInvoices = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const audit_1 = require("../../utils/audit");
const createInvoiceSchema = zod_1.z.object({
    visitId: zod_1.z.string(),
    items: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string(),
        quantity: zod_1.z.number(),
        unitPrice: zod_1.z.number(),
    })),
});
const createPaymentSchema = zod_1.z.object({
    invoiceId: zod_1.z.string(),
    amount: zod_1.z.number(),
    method: zod_1.z.enum(['CASH', 'MPESA', 'INSURANCE_SHA', 'INSURANCE_PRIVATE', 'CORPORATE']),
    transactionRef: zod_1.z.string().optional(),
});
const getInvoices = async (req, res) => {
    try {
        const { facilityId } = req.user;
        const { status } = req.query;
        const invoices = await database_1.default.invoice.findMany({
            where: {
                visit: { facilityId },
                ...(status && { status: status }),
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getInvoices = getInvoices;
const createInvoice = async (req, res) => {
    try {
        const data = createInvoiceSchema.parse(req.body);
        const { tenantId, userId } = req.user;
        const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const invoiceNumber = `INV${Date.now()}`;
        const invoice = await database_1.default.invoice.create({
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
        await (0, audit_1.createAuditLog)({
            userId,
            tenantId,
            action: 'CREATE',
            entity: 'INVOICE',
            entityId: invoice.id,
            changes: data,
        });
        res.status(201).json(invoice);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createInvoice = createInvoice;
const createPayment = async (req, res) => {
    try {
        const data = createPaymentSchema.parse(req.body);
        const { tenantId, userId } = req.user;
        const payment = await database_1.default.payment.create({
            data,
        });
        const invoice = await database_1.default.invoice.findUnique({
            where: { id: data.invoiceId },
            include: { payments: true },
        });
        if (invoice) {
            const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
            const status = totalPaid >= invoice.totalAmount ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : 'PENDING';
            await database_1.default.invoice.update({
                where: { id: data.invoiceId },
                data: { paidAmount: totalPaid, status },
            });
        }
        await (0, audit_1.createAuditLog)({
            userId,
            tenantId,
            action: 'CREATE',
            entity: 'PAYMENT',
            entityId: payment.id,
            changes: data,
        });
        res.status(201).json(payment);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createPayment = createPayment;
