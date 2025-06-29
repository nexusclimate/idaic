// login.js

const API_BASE = "https://api.nexusclimate.co"; // Update if needed

function isLoggedIn() {
  return !!localStorage.getItem('idaic-token');
}

if (isLoggedIn()) {
  window.location.href = '/main.html';
}

document.getElementById('otp-request-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  try {
    const res = await fetch(`${API_BASE}/otp/api/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send OTP");
    document.getElementById('otp-request-form').classList.add('hidden');
    document.getElementById('otp-verify-form').classList.remove('hidden');
    document.getElementById('code').focus();
    alert("OTP sent! Check your email.");
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('otp-verify-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const code  = document.getElementById('code').value.trim();
  try {
    const res = await fetch(`${API_BASE}/otp/api/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to verify OTP");
    localStorage.setItem('idaic-token', data.token || "dummy");
    window.location.href = '/main.html';
  } catch (err) {
    alert(err.message);
  }
});
