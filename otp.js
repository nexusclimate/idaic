// otp.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();

// ─── CORS ───────────────────────────────────────────────────────────────────────
// Allow your GitHub Pages or front-end origin
app.use(cors({
  origin: 'https://yourusername.github.io',  // replace as needed
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// ─── SUPABASE CLIENT ────────────────────────────────────────────────────────────
const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SERVICE_ROLE_KEY
);

// ─── MAILER (Mailgun SMTP) ───────────────────────────────────────────────────────
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── UTILITIES ───────────────────────────────────────────────────────────────────
function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// ─── 1) SEND OTP ENDPOINT ────────────────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // 1️⃣ Upsert user (no return needed here)
    const { error: upsertErr } = await db
      .from('membership.users')
      .upsert({ email });
    if (upsertErr) throw upsertErr;

    // 2️⃣ Fetch the user’s ID
    const { data: user, error: fetchErr } = await db
      .from('membership.users')
      .select('id')
      .eq('email', email)
      .single();
    if (fetchErr || !user) throw fetchErr || new Error('User fetch failed');

    // 3️⃣ Generate & store code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await db.from('membership.otps').insert({
      user_id:    user.id,
      code_hash:  hashCode(code),
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
    });

    // 4️⃣ Send via Mailgun
    await mailer.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      email,
      subject: 'Your nexusclimate Login Code',
      text:    `Your login code is ${code}. It expires in 5 minutes.`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('send-otp error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── 2) VERIFY OTP ENDPOINT ─────────────────────────────────────────────────────
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email & code required' });

    // Find user
    const { data: userData } = await db
      .from('membership.users')
      .select('id')
      .eq('email', email)
      .single();
    const user = userData;
    if (!user) return res.status(400).json({ error: 'Unknown email' });

    // Fetch latest unused OTP
    const { data: otpData } = await db
      .from('membership.otps')
      .select('*')
      .eq('user_id', user.id)
      .eq('used', false)
      .order('id', { ascending: false })
      .limit(1);
    const otp = otpData;
    if (
      !otp ||
      new Date(otp.expires_at) < new Date() ||
      hashCode(code) !== otp.code_hash
    ) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Mark used
    await db.from('membership.otps').update({ used: true }).eq('id', otp.id);

    // Issue JWT
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error('verify-otp error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── START SERVER ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OTP service listening on port ${PORT}`);
});
