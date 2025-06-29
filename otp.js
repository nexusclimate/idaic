// otp.js — FRONTEND version (served to browser)
export async function sendOtp(email) {
  // Use relative URL if served via Nginx proxy, else set absolute URL to your backend.
  const res = await fetch('/otp/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
  return data;
}

export async function verifyOtp(email, code) {
  const res = await fetch('/otp/api/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
  return data;
}

// Dummy isLoggedIn function
export function isLoggedIn() {
  return !!localStorage.getItem('idaic-token');
}
