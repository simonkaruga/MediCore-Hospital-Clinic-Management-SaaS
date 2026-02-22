import axios from 'axios';
import prisma from '../config/database';

const AT_API_KEY = process.env.AT_API_KEY || '';
const AT_USERNAME = process.env.AT_USERNAME || '';

export const sendSMS = async (to: string, message: string) => {
  try {
    await axios.post(
      'https://api.africastalking.com/version1/messaging',
      new URLSearchParams({ username: AT_USERNAME, to, message }),
      { headers: { apiKey: AT_API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    await prisma.smsLog.create({
      data: { recipient: to, message, status: 'SENT' },
    });
  } catch (error) {
    await prisma.smsLog.create({
      data: { recipient: to, message, status: 'FAILED' },
    });
  }
};
