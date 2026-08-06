const { Resend } = require('resend');
const env = require('../config/env');

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Send an email using Resend API.
 * @param {{ to: string, subject: string, html: string }} options
 * @returns {Promise<object|null>} Info object or null if no API key
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!env.RESEND_API_KEY) {
      console.warn('⚠️ No RESEND_API_KEY configured. Emails will not be sent.');
      return null;
    }

    const { data, error } = await resend.emails.send({
      from: `onboarding@resend.dev`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`❌ Resend API Error:`, error);
      throw new Error(error.message);
    }

    console.log(`📧 Email sent via Resend: ${subject} → ${to}`);
    return data;
  } catch (error) {
    console.error(`❌ Email send failed: ${error.message}`);
    throw error;
  }
};

module.exports = { sendEmail };
