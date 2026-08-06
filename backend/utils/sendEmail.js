const env = require('../config/env');

/**
 * Send an email using EmailJS REST API.
 * @param {{ to: string, subject: string, html: string }} options
 * @returns {Promise<object|null>} Info object or null if keys are missing
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!env.EMAILJS_SERVICE_ID || !env.EMAILJS_TEMPLATE_ID || !env.EMAILJS_PUBLIC_KEY) {
      console.warn('⚠️ EmailJS credentials missing. Emails will not be sent.');
      return null;
    }

    const payload = {
      service_id: env.EMAILJS_SERVICE_ID,
      template_id: env.EMAILJS_TEMPLATE_ID,
      user_id: env.EMAILJS_PUBLIC_KEY,
      accessToken: env.EMAILJS_PRIVATE_KEY, // Optional but recommended for backend calls
      template_params: {
        to_email: to,
        subject: subject,
        html_content: html,
      },
    };

    // Use native fetch to call EmailJS REST API
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ EmailJS API Error:`, errorText);
      throw new Error(`EmailJS Error: ${errorText}`);
    }

    console.log(`📧 Email sent via EmailJS: ${subject} → ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Email send failed: ${error.message}`);
    throw error;
  }
};

module.exports = { sendEmail };
