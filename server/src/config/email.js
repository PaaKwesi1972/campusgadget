import nodemailer from 'nodemailer';

let transporter = null;

// Ethereal is a fake SMTP service made for testing — emails never leave
// their sandbox, but you get a real preview link to see exactly what was sent.
async function getTransporter() {
  if (transporter) return transporter;
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return transporter;
}

export async function sendOtpEmail(toEmail, code) {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: '"CampusGadget" <no-reply@campusgadget.app>',
    to: toEmail,
    subject: 'Your CampusGadget verification code',
    text: `Your verification code is ${code}. It expires in 5 minutes.`,
    html: `<p>Your verification code is <b style="font-size:20px;">${code}</b>. It expires in 5 minutes.</p>`,
  });
  console.log('OTP email sent — preview it here:', nodemailer.getTestMessageUrl(info));
}

