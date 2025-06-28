// otp.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── POSTGRES POOL ────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.PG_CONNECTION,   // e.g. postgres://postgres:pwd@localhost:5432/postgres
});

// ─── MAILER ────────────────────────────────────────────────────────────────────
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── UTILS ─────────────────────────────────────────────────────────────────────
function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// ─── 1) SEND OTP ───────────────────────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert user
    const upsert = `
      INSERT INTO membership.users(email)
      VALUES ($1)
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `;
    let result = await client.query(upsert, [email]);
    const userId = result.rows[0]?.id
      || (await client.query('SELECT id FROM membership.users WHERE email = $1', [email]))
           .rows[0].id;

    // Create OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await client.query(
      `INSERT INTO membership.otps(user_id, code_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '5 minutes')`,
      [userId, hashCode(code)]
    );

    await client.query('COMMIT');

    // Send email
    await mailer.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your login code',
      text: `Your code is ${code}. It expires in 5 minutes.`,
    });

    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('send-otp error', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── 2) VERIFY OTP ─────────────────────────────────────────────────────────────
app.post('/api/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email + code required' });

  const client = await pool.connect();
  try {
    // Find user
    const { rows: urows } = await client.query(
      'SELECT id FROM membership.users WHERE email = $1',
      [email]
    );
    if (urows.length === 0) return res.status(400).json({ error: 'Unknown email' });
    const userId = urows[0].id;

    // Fetch latest unused OTP
    const { rows: orows } = await client.query(
      `SELECT id, code_hash, expires_at
       FROM membership.otps
       WHERE user_id = $1 AND used = false
       ORDER BY id DESC LIMIT 1`,
      [userId]
    );
    const otp = orows[0];
    if (
      !otp ||
      new Date(otp.expires_at) < new Date() ||
      hashCode(code) !== otp.code_hash
    ) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Mark used
    await client.query(
      'UPDATE membership.otps SET used = true WHERE id = $1',
      [otp.id]
    );

    // Issue JWT
    const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error('verify-otp error', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── START ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OTP service on port ${PORT}`));
