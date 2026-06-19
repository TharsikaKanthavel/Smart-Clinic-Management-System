const nodemailer = require('nodemailer');

const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];

function ensureConfig() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Email service not configured. Missing: ${missing.join(', ')}`);
  }
}

function getTransporter() {
  ensureConfig();
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendOtpEmail({ to, otp, subject }) {
  const transporter = getTransporter();
  const title = subject || 'SmartClinic OTP Verification';

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: title,
    text: `Your SmartClinic OTP is: ${otp}. It expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>SmartClinic</h2>
      <p>Your OTP code is:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:3px">${otp}</p>
      <p>This OTP expires in 10 minutes.</p>
    </div>`,
  });
}

module.exports = { sendOtpEmail };
