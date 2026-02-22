"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = void 0;
const database_1 = __importDefault(require("../config/database"));
const createAuditLog = async (data) => {
    await database_1.default.auditLog.create({
        data: {
            ...data,
            changes: data.changes ? JSON.stringify(data.changes) : null,
        },
    });
};
exports.createAuditLog = createAuditLog;
