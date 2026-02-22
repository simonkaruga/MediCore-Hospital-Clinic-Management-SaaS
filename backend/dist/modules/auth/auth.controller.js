"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.register = exports.login = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await database_1.default.user.findUnique({
            where: { email },
            include: { departments: true },
        });
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValid = await bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const payload = {
            userId: user.id,
            tenantId: user.tenantId,
            facilityId: user.facilityId,
            role: user.role,
            departments: user.departments.map(d => d.departmentId),
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        await database_1.default.user.update({
            where: { id: user.id },
            data: { refreshToken, lastLogin: new Date() },
        });
        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const register = async (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
};
exports.register = register;
const refresh = async (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
};
exports.refresh = refresh;
const logout = async (req, res) => {
    res.json({ message: 'Logged out' });
};
exports.logout = logout;
