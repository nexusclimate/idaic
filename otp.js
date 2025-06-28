// ABC.js
const API = 'https://api.nexusclimate.co/otp';

/** Render a temporary toast in the live region */
export function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5';
  toast.innerHTML = `
    <div class="p-4 flex items-start">
      <svg class="w-6 h-6 text-[#FF9900] shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      <div class="ml-3 w-0 flex-1 pt-0.5">
        <p class="text-sm font-medium text-gray-900">${message}</p>
      </div>
      <button onclick="this.closest('div').remove()"
              class="ml-4 inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-[#FF9900] focus:outline-none">
        <span class="sr-only">Close</span>
        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72
                   a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72
                   a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72
                   a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

/** Send an OTP to `email` and show a toast */
export async function sendOtp(email) {
  const res = await fetch(`${API}/api/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }
  showToast('OTP sent! Check your inbox.');
}

/** Verify the code, store the JWT, and redirect */
export async function verifyOtp(email, code) {
  const res = await fetch(`${API}/api/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error);
  }
  localStorage.setItem('nexus_jwt', body.token);
  window.location.href = '/main.html';
}

/** Check if the user is already logged in */
export function isLoggedIn() {
  return !!localStorage.getItem('nexus_jwt');
}

/** Redirect to login if not authenticated */
export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
  }
}
