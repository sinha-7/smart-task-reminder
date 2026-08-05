const nodemailer = require('nodemailer');
const env = require('../config/env');

/**
 * Create a reusable nodemailer transporter.
 * Uses SMTP config from environment variables.
 * Falls back to Ethereal test account in development if no SMTP_USER is set.
 */
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // If no SMTP credentials are configured, create an Ethereal test account
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    if (env.isDev) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Using Ethereal test email account:', testAccount.user);
      return transporter;
    }
    console.warn('⚠️ No SMTP credentials configured. Emails will not be sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
};

/**
 * Send an email.
 * @param {{ to: string, subject: string, html: string }} options
 * @returns {Promise<object|null>} Info object or null if no transporter
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transport = await getTransporter();
    if (!transport) {
      console.warn(`📧 Email skipped (no transporter): ${subject} → ${to}`);
      return null;
    }

    const info = await transport.sendMail({
      from: `"Smart Tasks" <${env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    // Log Ethereal preview URL in development
    if (env.isDev) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`📧 Preview URL: ${previewUrl}`);
      }
    }

    console.log(`📧 Email sent: ${subject} → ${to}`);
    return info;
  } catch (error) {
    console.error(`❌ Email send failed: ${error.message}`);
    throw error;
  }
};

module.exports = { sendEmail, getTransporter };
