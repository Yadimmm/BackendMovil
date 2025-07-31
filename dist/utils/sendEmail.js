"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetEmail = sendResetEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const allowSelfSigned = process.env.SMTP_ALLOW_SELF_SIGNED === 'true';
const transporter = nodemailer_1.default.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
    ...(allowSelfSigned && {
        tls: { rejectUnauthorized: false }
    }),
});
async function sendResetEmail(to, resetLink) {
    const mailOptions = {
        from: '"Cinnami" <cinnami.noreply@gmail.com>',
        to,
        subject: 'Restablece tu contraseña',
        html: `
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Este enlace es válido por 1 hora.</p>
    `,
    };
    await transporter.sendMail(mailOptions);
}
