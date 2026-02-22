"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const database_1 = __importDefault(require("../../config/database"));
const getDashboardStats = async (req, res) => {
    try {
        const { tenantId, facilityId } = req.user;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalPatients, todayAppointments, pendingLabs, todayRevenue] = await Promise.all([
            database_1.default.patient.count({ where: { tenantId } }),
            database_1.default.appointment.count({
                where: { appointmentDate: { gte: today } },
            }),
            database_1.default.labRequest.count({ where: { status: 'PENDING' } }),
            database_1.default.payment.aggregate({
                where: { paidAt: { gte: today } },
                _sum: { amount: true },
            }),
        ]);
        res.json({
            totalPatients,
            todayAppointments,
            pendingLabs,
            todayRevenue: todayRevenue._sum.amount || 0,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getDashboardStats = getDashboardStats;
