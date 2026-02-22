"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dischargePatient = exports.getAdmissions = exports.admitPatient = exports.getBeds = exports.createBed = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const createBedSchema = zod_1.z.object({
    wardName: zod_1.z.string(),
    bedNumber: zod_1.z.string(),
});
const admitPatientSchema = zod_1.z.object({
    patientId: zod_1.z.string(),
    bedId: zod_1.z.string(),
    admissionReason: zod_1.z.string(),
});
const createBed = async (req, res) => {
    try {
        const data = createBedSchema.parse(req.body);
        const { facilityId } = req.user;
        const bed = await database_1.default.bed.create({
            data: { ...data, facilityId },
        });
        res.status(201).json(bed);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createBed = createBed;
const getBeds = async (req, res) => {
    try {
        const { facilityId } = req.user;
        const beds = await database_1.default.bed.findMany({
            where: { facilityId },
            include: {
                admissions: {
                    where: { status: 'ACTIVE' },
                    include: { patient: true },
                },
            },
            orderBy: [{ wardName: 'asc' }, { bedNumber: 'asc' }],
        });
        res.json(beds);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getBeds = getBeds;
const admitPatient = async (req, res) => {
    try {
        const data = admitPatientSchema.parse(req.body);
        const { userId } = req.user;
        const admission = await database_1.default.admission.create({
            data: { ...data, admittedBy: userId },
            include: { patient: true, bed: true },
        });
        await database_1.default.bed.update({
            where: { id: data.bedId },
            data: { status: 'OCCUPIED' },
        });
        res.status(201).json(admission);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.admitPatient = admitPatient;
const getAdmissions = async (req, res) => {
    try {
        const { facilityId } = req.user;
        const admissions = await database_1.default.admission.findMany({
            where: { bed: { facilityId } },
            include: { patient: true, bed: true },
            orderBy: { admissionDate: 'desc' },
        });
        res.json(admissions);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAdmissions = getAdmissions;
const dischargeSchema = zod_1.z.object({
    dischargeSummary: zod_1.z.string(),
});
const dischargePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const data = dischargeSchema.parse(req.body);
        const admission = await database_1.default.admission.update({
            where: { id },
            data: {
                status: 'DISCHARGED',
                dischargeDate: new Date(),
                dischargeSummary: data.dischargeSummary,
            },
            include: { bed: true },
        });
        await database_1.default.bed.update({
            where: { id: admission.bedId },
            data: { status: 'AVAILABLE' },
        });
        res.json(admission);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.dischargePatient = dischargePatient;
