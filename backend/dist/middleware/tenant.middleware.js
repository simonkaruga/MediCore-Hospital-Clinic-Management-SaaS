"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantIsolation = void 0;
const tenantIsolation = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};
exports.tenantIsolation = tenantIsolation;
