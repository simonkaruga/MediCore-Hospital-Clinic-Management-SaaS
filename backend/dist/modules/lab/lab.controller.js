"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLabResult = exports.createLabRequest = exports.getLabRequests = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const audit_1 = require("../../utils/audit");
const createLabRequestSchema = zod_1.z.object({
    visitId: zod_1.z.string(),
    testName: zod_1.z.string(),
    testCode: zod_1.z.string().optional(),
    urgency: zod_1.z.enum(['ROUTINE', 'URGENT', 'STAT']).default('ROUTINE'),
    notes: zod_1.z.string().optional(),
});
const createLabResultSchema = zod_1.z.object({
    requestId: zod_1.z.string(),
    result: zod_1.z.string(),
    unit: zod_1.z.string().optional(),
    referenceRange: zod_1.z.string().optional(),
    isCritical: zod_1.z.boolean().default(false),
});
const getLabRequests = async (req, res) => {
    try {
        const { facilityId } = req.user;
        const { status } = req.query;
        const requests = await database_1.default.labRequest.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getLabRequests = getLabRequests;
const createLabRequest = async (req, res) => {
    try {
        const data = createLabRequestSchema.parse(req.body);
        const { userId, tenantId } = req.user;
        const request = await database_1.default.labRequest.create({
            data: {
                ...data,
                requestedBy: userId,
            },
        });
        await (0, audit_1.createAuditLog)({
            userId,
            tenantId,
            action: 'CREATE',
            entity: 'LAB_REQUEST',
            entityId: request.id,
            changes: data,
        });
        res.status(201).json(request);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createLabRequest = createLabRequest;
const createLabResult = async (req, res) => {
    try {
        const data = createLabResultSchema.parse(req.body);
        const { userId, tenantId } = req.user;
        const result = await database_1.default.labResult.create({
            data: {
                ...data,
                performedBy: userId,
            },
        });
        await database_1.default.labRequest.update({
            where: { id: data.requestId },
            data: { status: 'COMPLETED' },
        });
        await (0, audit_1.createAuditLog)({
            userId,
            tenantId,
            action: 'CREATE',
            entity: 'LAB_RESULT',
            entityId: result.id,
            changes: data,
        });
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createLabResult = createLabResult;
