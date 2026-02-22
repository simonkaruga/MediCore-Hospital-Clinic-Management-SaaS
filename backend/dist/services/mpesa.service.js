"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateSTKPush = void 0;
const axios_1 = __importDefault(require("axios"));
const MPESA_BASE_URL = 'https://sandbox.safaricom.co.ke';
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
let accessToken = null;
const getAccessToken = async () => {
    if (accessToken)
        return accessToken;
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const response = await axios_1.default.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${auth}` } });
    accessToken = response.data.access_token;
    return accessToken;
};
const initiateSTKPush = async (phone, amount, reference) => {
    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const response = await axios_1.default.post(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64'),
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: reference,
        TransactionDesc: 'Payment',
    }, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
};
exports.initiateSTKPush = initiateSTKPush;
