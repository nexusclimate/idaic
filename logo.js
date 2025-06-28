// logo.js

// 1) Paste your PAT here:
const ACCESS_TOKEN = 'pat-eu1-022ef71a-889d-48d0-be8e-96b1f6de1e99';

// 2) Set your folder path exactly as in HubSpot:
const FOLDER_PATH = '/logos';

// 3) Fetch all files in that folder
async function fetchLogos() {
  const url = `https://api.hubapi.com/filemanager/api/v3/files`
            + `?folder_paths=${encodeURIComponent(FOLDER_PATH)}`
            + `&limit=100`;

  const res = await fetch(url, {
    headers: {
      // Use Bearer auth with your PAT
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    }
  });
  if (!res.ok) {
    throw new Error(`HubSpot API error: ${res.status}`);
  }
  const json = await res.json();
  return json.objects || [];
}

// 4) Render each logo into the grid in members.html
function renderLogos(files) {
  const container = document.querySelector('#logoGrid');
  files.forEach(f => {
    const a = document.createElement('a');
    a.href      = f.url;
    a.target    = '_blank';
    a.className =
      `relative flex items-center justify-center p-8 sm:p-10
       bg-gray-100 border border-transparent rounded-lg
       focus-within:ring-2 focus-within:ring-orange-500
       focus-within:ring-offset-2 hover:border-gray-400 transition`;

    a.innerHTML = `
      <span class="absolute inset-0" aria-hidden="true"></span>
      <img src="${f.url}" alt="${f.name}" class="max-h-20 w-auto object-contain" />
    `;
    container.appendChild(a);
  });
}

// 5) Kick it all off
(async () => {
  try {
    const logos = await fetchLogos();
    renderLogos(logos);
  } catch (err) {
    console.error(err);
    // Optionally: show a user-friendly error in the UI
  }
})();
