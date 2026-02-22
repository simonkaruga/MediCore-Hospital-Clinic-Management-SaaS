"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentStatus = exports.getAppointments = exports.createAppointment = void 0;
const database_1 = __importDefault(require("../../config/database"));
const createAppointment = async (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
};
exports.createAppointment = createAppointment;
const getAppointments = async (req, res) => {
    try {
        const { userId } = req.user;
        const { doctorId, date } = req.query;
        const where = {};
        if (doctorId)
            where.doctorId = doctorId;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            where.appointmentDate = { gte: startDate, lt: endDate };
        }
        const appointments = await database_1.default.appointment.findMany({
            where,
            include: {
                patient: true,
                doctor: { select: { firstName: true, lastName: true } },
                department: true,
            },
            orderBy: { appointmentDate: 'asc' },
        });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAppointments = getAppointments;
const updateAppointmentStatus = async (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
};
exports.updateAppointmentStatus = updateAppointmentStatus;
