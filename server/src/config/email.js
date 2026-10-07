import nodemailer from 'nodemailer';

let transporter = null;
let usingRealEmail = false;

// Uses a REAL email account when EMAIL_USER and EMAIL_PASS are set in .env.
// If they are missing, it falls back to Ethereal (a fake test inbox), so the
// app never crashes during development.
async function getTransporter() {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (EMAIL_USER && EMAIL_PASS) {
    const port = Number(EMAIL_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465, // true for 465, false for 587
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
    usingRealEmail = true;
    console.log(`Email: sending REAL emails through ${EMAIL_HOST || 'smtp.gmail.com'} as ${EMAIL_USER}`);
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    usingRealEmail = false;
    console.log('Email: EMAIL_USER / EMAIL_PASS not set, using the Ethereal TEST inbox (no real emails).');
  }
  return transporter;
}

export async function sendOtpEmail(toEmail, code) {
  const t = await getTransporter();
  const from = process.env.EMAIL_FROM || `"CampusGadget" <${process.env.EMAIL_USER || 'no-reply@campusgadget.app'}>`;

  const info = await t.sendMail({
    from,
    to: toEmail,
    subject: 'Your CampusGadget verification code',
    text: `Your verification code is ${code}. It expires in 5 minutes.`,
    html: `<p>Your verification code is <b style="font-size:20px;">${code}</b>. It expires in 5 minutes.</p>`,
  });

  if (usingRealEmail) {
    console.log(`OTP email sent to ${toEmail} (message id: ${info.messageId})`);
  } else {
    console.log('OTP email (TEST only) — preview it here:', nodemailer.getTestMessageUrl(info));
  }
}