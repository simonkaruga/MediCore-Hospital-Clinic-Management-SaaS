"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const patients_routes_1 = __importDefault(require("./modules/patients/patients.routes"));
const appointments_routes_1 = __importDefault(require("./modules/appointments/appointments.routes"));
const emr_routes_1 = __importDefault(require("./modules/emr/emr.routes"));
const lab_routes_1 = __importDefault(require("./modules/lab/lab.routes"));
const pharmacy_routes_1 = __importDefault(require("./modules/pharmacy/pharmacy.routes"));
const billing_routes_1 = __importDefault(require("./modules/billing/billing.routes"));
const tenants_routes_1 = __importDefault(require("./modules/tenants/tenants.routes"));
const queue_routes_1 = __importDefault(require("./modules/queue/queue.routes"));
const inpatient_routes_1 = __importDefault(require("./modules/inpatient/inpatient.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/tenants', tenants_routes_1.default);
app.use('/api/patients', patients_routes_1.default);
app.use('/api/appointments', appointments_routes_1.default);
app.use('/api/emr', emr_routes_1.default);
app.use('/api/lab', lab_routes_1.default);
app.use('/api/pharmacy', pharmacy_routes_1.default);
app.use('/api/billing', billing_routes_1.default);
app.use('/api/queue', queue_routes_1.default);
app.use('/api/inpatient', inpatient_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.listen(PORT, () => {
    console.log(`🏥 MediCore API running on port ${PORT}`);
});
