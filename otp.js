  GNU nano 6.2                                      otp.js                                                
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});




const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const pool = new Pool({ connectionString: process.env.PG_CONNECTION });

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert into public.users
    await client.query(
      'INSERT INTO public.users(email) VALUES ($1) ON CONFLICT(email) DO NOTHING;',
      [email]
    );

 
