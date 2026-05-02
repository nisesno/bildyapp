import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.MAIL_FROM || 'no-reply@bildy.test';

export const sendVerificationEmail = (to, code) => {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: 'Tu codigo de verificacion',
    text: 'Tu codigo es: ' + code,
  });
};

export const sendInviteEmail = (to, tempPassword) => {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: 'Invitacion a Bildyapp',
    text: 'Tu password temporal: ' + tempPassword,
  });
};
