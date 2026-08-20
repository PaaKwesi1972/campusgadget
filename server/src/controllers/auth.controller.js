import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { sendOtpEmail } from '../config/email.js';

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function signUp(req, res) {
  const { fullName, email, password, userType } = req.body;
  const type = userType === 'vendor' ? 'vendor' : 'student';

  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  if (type === 'student' && !email.endsWith('@st.ug.edu.gh')) {
    return res.status(400).json({ success: false, error: 'Please use your university email (@st.ug.edu.gh).' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otpCode = type === 'student' ? generateOtp() : null;
    const otpExpiresAt = type === 'student' ? new Date(Date.now() + 5 * 60 * 1000) : null;

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, user_type, is_verified, otp_code, otp_expires_at)
       VALUES ($1, $2, $3, $4, false, $5, $6)
       RETURNING id, full_name, email, user_type`,
      [fullName, email, passwordHash, type, otpCode, otpExpiresAt]
    );

    const newUser = result.rows[0];

    if (type === 'student') {
      try {
        await sendOtpEmail(email, otpCode);
      } catch (emailErr) {
        console.error('OTP EMAIL SEND ERROR:', emailErr.message);
      }
    }

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      user: newUser,
      token,
    });
  } catch (err) {
    console.error('SIGNUP ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
}

export async function verifyOtp(req, res) {
  const userId = req.userId;
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: 'Enter the 6-digit code.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }
    const user = result.rows[0];

    if (user.is_verified) {
      return res.json({ success: true, alreadyVerified: true });
    }

    if (!user.otp_code || !user.otp_expires_at) {
      return res.status(400).json({ success: false, error: 'No pending verification code. Request a new one.' });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ success: false, error: 'This code has expired. Request a new one.' });
    }

    if (code !== user.otp_code) {
      return res.status(400).json({ success: false, error: 'Incorrect code. Please try again.' });
    }

    await pool.query(
      `UPDATE users SET is_verified = true, otp_code = NULL, otp_expires_at = NULL WHERE id = $1`,
      [userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('VERIFY OTP ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not verify your code.' });
  }
}

export async function resendOtp(req, res) {
  const userId = req.userId;

  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }
    const user = result.rows[0];

    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      `UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3`,
      [otpCode, otpExpiresAt, userId]
    );

    await sendOtpEmail(user.email, otpCode);

    res.json({ success: true });
  } catch (err) {
    console.error('RESEND OTP ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not resend code.' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.is_suspended) {
      return res.status(403).json({ success: false, error: 'This account has been suspended. Contact support for details.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        user_type: user.user_type,
      },
      token,
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
}