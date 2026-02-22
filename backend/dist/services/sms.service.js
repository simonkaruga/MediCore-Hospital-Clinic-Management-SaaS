"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
const axios_1 = __importDefault(require("axios"));
const database_1 = __importDefault(require("../config/database"));
const AT_API_KEY = process.env.AT_API_KEY || '';
const AT_USERNAME = process.env.AT_USERNAME || '';
const sendSMS = async (to, message) => {
    try {
        await axios_1.default.post('https://api.africastalking.com/version1/messaging', new URLSearchParams({ username: AT_USERNAME, to, message }), { headers: { apiKey: AT_API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' } });
        await database_1.default.smsLog.create({
            data: { recipient: to, message, status: 'SENT' },
        });
    }
    catch (error) {
        await database_1.default.smsLog.create({
            data: { recipient: to, message, status: 'FAILED' },
        });
    }
};
exports.sendSMS = sendSMS;
