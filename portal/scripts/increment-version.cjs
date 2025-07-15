const fs = require('fs');
const path = require('path');

const versionFiles = [
  path.join(__dirname, '../version.txt'),
  path.join(__dirname, '../src/config/version.js'),
  path.join(__dirname, '../index.html'),
  path.join(__dirname, '../package.json'),
  path.join(__dirname, '../portal/package.json')
];

function updateVersionInFile(file, newVersion) {
  let content = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.json')) {
    const json = JSON.parse(content);
    json.version = newVersion;
    fs.writeFileSync(file, JSON.stringify(json, null, 2));
  } else if (file.endsWith('.js')) {
    content = content.replace(/export const VERSION = '.*?';/, `export const VERSION = '${newVersion}';`);
    fs.writeFileSync(file, content);
  } else if (file.endsWith('.html')) {
    content = content.replace(/(<meta name="version" content=")(.*?)(")/, `$1${newVersion}$3`);
    fs.writeFileSync(file, content);
  } else {
    fs.writeFileSync(file, newVersion + '\n');
  }
}

let currentVersion = '0.0.0.0';
try {
  currentVersion = fs.readFileSync(path.join(__dirname, '../version.txt'), 'utf8').trim();
} catch {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
    currentVersion = pkg.version;
  } catch {}
}

const parts = currentVersion.split('.');
if (parts.length !== 4) {
  console.error('Current version is not in 0.M.W.X format:', currentVersion);
  process.exit(1);
}

const bumpType = process.argv[2] || 'patch';
let [zero, M, W, X] = parts.map(Number);

if (bumpType === 'major') {
  M += 1;
  W = 0;
  X = 0;
} else if (bumpType === 'minor') {
  W += 1;
  X = 0;
} else {
  X += 1;
}

const newVersion = `0.${M}.${W}.${X}`;
console.log(`Updating version: ${currentVersion} → ${newVersion}`);

for (const file of versionFiles) {
  if (fs.existsSync(file)) {
    updateVersionInFile(file, newVersion);
    console.log(`Updated ${file}`);
  }
} 