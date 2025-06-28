// (1) Your HubSpot credentials or proxy
const HUBSPOT_API_KEY = 'YOUR_HUBSPOT_API_KEY';
const FOLDER_PATH     = '/logos';  // your File Manager folder

// (2) Fetch all files in the folder
async function fetchLogos() {
  const url =
    `https://api.hubapi.com/filemanager/api/v3/files`
    + `?folder_paths=${encodeURIComponent(FOLDER_PATH)}`
    + `&limit=100&hapikey=${HUBSPOT_API_KEY}`;

  let res = await fetch(url);
  if (!res.ok) throw new Error(`HubSpot error ${res.status}`);
  let json = await res.json();
  return json.objects || [];
}

// (3) Render each logo into the grid
function renderLogos(files) {
  const container = document.querySelector('#logoGrid');
  files.forEach(f => {
    const a = document.createElement('a');
    a.href        = f.url;
    a.target      = '_blank';
    a.className   =
      `relative flex items-center justify-center p-8 sm:p-10
       bg-gray-100 border border-transparent rounded-lg
       focus-within:ring-2 focus-within:ring-orange-500
       focus-within:ring-offset-2 hover:border-gray-400 transition`;

    a.innerHTML = `
      <span class="absolute inset-0" aria-hidden="true"></span>
      <img src="${f.url}"
           alt="${f.name}"
           class="max-h-20 w-auto object-contain" />
    `;
    container.appendChild(a);
  });
}

// (4) Kick it off
(async () => {
  try {
    const logos = await fetchLogos();
    renderLogos(logos);
  } catch (err) {
    console.error(err);
    // optionally show an error message in the UI
  }
})();
