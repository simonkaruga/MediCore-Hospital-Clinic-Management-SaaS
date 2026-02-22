"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePatient = exports.getPatient = exports.getPatients = exports.createPatient = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const createPatientSchema = zod_1.z.object({
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    dateOfBirth: zod_1.z.string(),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'OTHER']),
    phone: zod_1.z.string(),
    email: zod_1.z.string().optional(),
    nationalId: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    nextOfKinName: zod_1.z.string().optional(),
    nextOfKinPhone: zod_1.z.string().optional(),
    allergies: zod_1.z.string().optional(),
    chronicConditions: zod_1.z.string().optional(),
});
const createPatient = async (req, res) => {
    try {
        const data = createPatientSchema.parse(req.body);
        const { tenantId, facilityId } = req.user;
        const patient = await database_1.default.patient.create({
            data: {
                ...data,
                dateOfBirth: new Date(data.dateOfBirth),
                patientNumber: `P${Date.now()}`,
                tenantId,
                facilityId,
            },
        });
        res.status(201).json(patient);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createPatient = createPatient;
const getPatients = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { search, q } = req.query;
        const searchTerm = search || q;
        const where = { tenantId };
        if (searchTerm) {
            where.OR = [
                { firstName: { contains: searchTerm } },
                { lastName: { contains: searchTerm } },
                { patientNumber: { contains: searchTerm } },
                { phone: { contains: searchTerm } },
            ];
        }
        const patients = await database_1.default.patient.findMany({
            where,
            take: searchTerm ? 10 : 50,
            orderBy: { createdAt: 'desc' },
        });
        res.json({ data: patients });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPatients = getPatients;
const getPatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId } = req.user;
        const patient = await database_1.default.patient.findFirst({
            where: { id, tenantId },
        });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(patient);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPatient = getPatient;
const updatePatient = async (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
};
exports.updatePatient = updatePatient;
