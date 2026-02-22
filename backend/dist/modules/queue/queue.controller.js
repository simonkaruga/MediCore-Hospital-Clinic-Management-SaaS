"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeQueue = exports.callNext = exports.getQueue = exports.addToQueue = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const addToQueueSchema = zod_1.z.object({
    patientId: zod_1.z.string(),
    departmentId: zod_1.z.string(),
    priority: zod_1.z.number().default(0),
    triageLevel: zod_1.z.enum(['RED', 'ORANGE', 'YELLOW', 'GREEN']).optional(),
});
const addToQueue = async (req, res) => {
    try {
        const data = addToQueueSchema.parse(req.body);
        const queueEntry = await database_1.default.queueEntry.create({ data });
        res.status(201).json(queueEntry);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.addToQueue = addToQueue;
const getQueue = async (req, res) => {
    try {
        const { departmentId } = req.query;
        const { departments } = req.user;
        const queue = await database_1.default.queueEntry.findMany({
            where: {
                departmentId: departmentId || { in: departments },
                status: 'WAITING',
            },
            orderBy: [{ priority: 'desc' }, { joinedAt: 'asc' }],
        });
        res.json(queue);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getQueue = getQueue;
const callNext = async (req, res) => {
    try {
        const { id } = req.params;
        const queueEntry = await database_1.default.queueEntry.update({
            where: { id },
            data: { status: 'IN_PROGRESS', calledAt: new Date() },
        });
        res.json(queueEntry);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.callNext = callNext;
const completeQueue = async (req, res) => {
    try {
        const { id } = req.params;
        const queueEntry = await database_1.default.queueEntry.update({
            where: { id },
            data: { status: 'COMPLETED', completedAt: new Date() },
        });
        res.json(queueEntry);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.completeQueue = completeQueue;
