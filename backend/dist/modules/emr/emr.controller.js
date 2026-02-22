"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClinicalNote = exports.createVisit = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const audit_1 = require("../../utils/audit");
const createVisitSchema = zod_1.z.object({
    patientId: zod_1.z.string(),
    visitType: zod_1.z.enum(['OUTPATIENT', 'EMERGENCY', 'INPATIENT']),
    chiefComplaint: zod_1.z.string().optional(),
});
const createClinicalNoteSchema = zod_1.z.object({
    visitId: zod_1.z.string(),
    subjective: zod_1.z.string().optional(),
    objective: zod_1.z.string().optional(),
    assessment: zod_1.z.string().optional(),
    plan: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
const createVisit = async (req, res) => {
    try {
        const data = createVisitSchema.parse(req.body);
        const { facilityId, tenantId, userId } = req.user;
        const visitNumber = `V${Date.now()}`;
        const visit = await database_1.default.patientVisit.create({
            data: {
                ...data,
                visitNumber,
                facilityId,
            },
            include: { patient: true },
        });
        await (0, audit_1.createAuditLog)({
            userId,
            tenantId,
            action: 'CREATE',
            entity: 'VISIT',
            entityId: visit.id,
            changes: data,
        });
        res.status(201).json(visit);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createVisit = createVisit;
const createClinicalNote = async (req, res) => {
    try {
        const data = createClinicalNoteSchema.parse(req.body);
        const { userId, tenantId } = req.user;
        const note = await database_1.default.clinicalNote.create({
            data: {
                ...data,
                doctorId: userId,
            },
        });
        await (0, audit_1.createAuditLog)({
            userId,
            tenantId,
            action: 'CREATE',
            entity: 'CLINICAL_NOTE',
            entityId: note.id,
            changes: data,
        });
        res.status(201).json(note);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createClinicalNote = createClinicalNote;
