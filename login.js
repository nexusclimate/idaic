const API_BASE = "https://api.nexusclimate.co/otp/api";

function createNotification({ message, success = true }) {
  const container = document.getElementById('notification-list');
  if (!container) return;

  // Clear previous notifications
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5';

  wrapper.innerHTML = `
    <div class="p-4">
      <div class="flex items-start">
        <div class="shrink-0">
          ${success ? `
          <svg class="size-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>` : `
          <svg class="size-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12" />
          </svg>`}
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm font-medium text-gray-900">${message}</p>
        </div>
        <div class="ml-4 flex shrink-0">
          <button type="button" class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none" aria-label="Close notification">
            <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  container.appendChild(wrapper);

  // Close button event
  wrapper.querySelector('button').addEventListener('click', () => {
    wrapper.remove();
  });
}

// Usage in your form handlers:

document.getElementById('otp-request-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  try {
    const res = await fetch(`${API_BASE}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send OTP");
    document.getElementById('otp-request-form').classList.add('hidden');
    document.getElementById('otp-verify-form').classList.remove('hidden');
    document.getElementById('code').focus();
    createNotification({ message: "OTP sent! Check your email.", success: true });
  } catch (err) {
    createNotification({ message: err.message, success: false });
  }
});

document.getElementById('otp-verify-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const code  = document.getElementById('code').value.trim();
  try {
    const res = await fetch(`${API_BASE}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to verify OTP");
    localStorage.setItem('idaic-token', data.token || "dummy");
    createNotification({ message: "Successfully signed in!", success: true });
    window.location.href = '/main.html';
  } catch (err) {
    createNotification({ message: err.message, success: false });
  }
});
