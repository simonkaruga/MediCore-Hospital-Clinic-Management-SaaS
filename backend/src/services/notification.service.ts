import axios from 'axios';

const AFRICASTALKING_API_KEY = process.env.AFRICASTALKING_API_KEY || '';
const AFRICASTALKING_USERNAME = process.env.AFRICASTALKING_USERNAME || 'sandbox';

export const sendSMS = async (phone: string, message: string) => {
  if (!AFRICASTALKING_API_KEY) {
    console.log('SMS not configured. Would send:', { phone, message });
    return { success: false, message: 'SMS service not configured' };
  }

  try {
    const response = await axios.post(
      'https://api.africastalking.com/version1/messaging',
      new URLSearchParams({
        username: AFRICASTALKING_USERNAME,
        to: phone,
        message: message,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': AFRICASTALKING_API_KEY,
        },
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('SMS send failed:', error);
    return { success: false, error };
  }
};

export const sendAppointmentReminder = async (phone: string, patientName: string, appointmentDate: Date) => {
  const message = `Hello ${patientName}, this is a reminder of your appointment at MediCore Hospital on ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString()}. Please arrive 15 minutes early.`;
  return sendSMS(phone, message);
};

export const sendLabResultNotification = async (phone: string, patientName: string) => {
  const message = `Hello ${patientName}, your lab results are ready. Please visit MediCore Hospital to collect them or contact us at +254700000000.`;
  return sendSMS(phone, message);
};

export const sendPrescriptionReady = async (phone: string, patientName: string) => {
  const message = `Hello ${patientName}, your prescription is ready for collection at MediCore Hospital Pharmacy. Please bring your ID.`;
  return sendSMS(phone, message);
};
