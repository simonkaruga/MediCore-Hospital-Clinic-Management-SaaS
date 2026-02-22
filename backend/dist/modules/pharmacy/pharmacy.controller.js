"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispensePrescription = exports.createPrescription = exports.getPrescriptions = exports.getInventory = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const audit_1 = require("../../utils/audit");
const createPrescriptionSchema = zod_1.z.object({
    visitId: zod_1.z.string(),
    items: zod_1.z.array(zod_1.z.object({
        drugName: zod_1.z.string(),
        dosage: zod_1.z.string(),
        frequency: zod_1.z.string(),
        duration: zod_1.z.string(),
        quantity: zod_1.z.number(),
        instructions: zod_1.z.string().optional(),
    })),
    notes: zod_1.z.string().optional(),
});
const getInventory = async (req, res) => {
    try {
        const { facilityId } = req.user;
        const { search } = req.query;
        const items = await database_1.default.inventoryItem.findMany({
            where: {
                facilityId,
                category: 'MEDICATION',
                ...(search && {
                    OR: [
                        { itemName: { contains: search } },
                        { genericName: { contains: search } },
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getInventory = getInventory;
const getPrescriptions = async (req, res) => {
    try {
        const { facilityId } = req.user;
        const { status } = req.query;
        const prescriptions = await database_1.default.prescription.findMany({
            where: {
                visit: { facilityId },
                ...(status && { status: status }),
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPrescriptions = getPrescriptions;
const createPrescription = async (req, res) => {
    try {
        const data = createPrescriptionSchema.parse(req.body);
        const { userId, tenantId } = req.user;
        const prescription = await database_1.default.prescription.create({
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
        await (0, audit_1.createAuditLog)({
            userId,
            tenantId,
            action: 'CREATE',
            entity: 'PRESCRIPTION',
            entityId: prescription.id,
            changes: data,
        });
        res.status(201).json(prescription);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createPrescription = createPrescription;
const dispensePrescription = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId, userId } = req.user;
        const prescription = await database_1.default.prescription.update({
            where: { id },
            data: { status: 'DISPENSED' },
        });
        await (0, audit_1.createAuditLog)({
            userId,
            tenantId,
            action: 'UPDATE',
            entity: 'PRESCRIPTION',
            entityId: id,
            changes: { status: 'DISPENSED' },
        });
        res.json(prescription);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.dispensePrescription = dispensePrescription;
