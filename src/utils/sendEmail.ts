import nodemailer from 'nodemailer';

const allowSelfSigned = process.env.SMTP_ALLOW_SELF_SIGNED === 'true';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  ...(allowSelfSigned && {
    tls: { rejectUnauthorized: false }
  }),
});

export async function sendResetEmail(to: string, resetLink: string): Promise<void> {
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