"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFacility = exports.createTenant = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const createTenantSchema = zod_1.z.object({
    name: zod_1.z.string(),
    subdomain: zod_1.z.string(),
    isGroup: zod_1.z.boolean().default(false),
    plan: zod_1.z.enum(['BASIC', 'PRO', 'ENTERPRISE']).default('BASIC'),
});
const createFacilitySchema = zod_1.z.object({
    tenantId: zod_1.z.string(),
    name: zod_1.z.string(),
    address: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
});
const createTenant = async (req, res) => {
    try {
        const data = createTenantSchema.parse(req.body);
        const tenant = await database_1.default.tenant.create({
            data,
        });
        res.status(201).json(tenant);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createTenant = createTenant;
const createFacility = async (req, res) => {
    try {
        const data = createFacilitySchema.parse(req.body);
        const facility = await database_1.default.facility.create({
            data,
        });
        res.status(201).json(facility);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createFacility = createFacility;
