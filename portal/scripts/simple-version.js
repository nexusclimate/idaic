#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read version from version.txt
const versionPath = path.join(__dirname, '../version.txt');
const version = fs.readFileSync(versionPath, 'utf8').trim();

console.log(`🔄 Updating version to ${version}`);

// Update index.html
const htmlPath = path.join(__dirname, '../index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

if (htmlContent.includes('meta name="version"')) {
  htmlContent = htmlContent.replace(/<meta name="version" content="[^"]*"/, `<meta name="version" content="${version}"`);
} else {
  htmlContent = htmlContent.replace('</head>', `    <meta name="version" content="${version}">\n  </head>`);
}

fs.writeFileSync(htmlPath, htmlContent);
console.log(`✅ Updated index.html`);

// Create simple version.js
const versionJsPath = path.join(__dirname, '../src/config/version.js');
const versionJsDir = path.dirname(versionJsPath);

if (!fs.existsSync(versionJsDir)) {
  fs.mkdirSync(versionJsDir, { recursive: true });
}

const versionJsContent = `export const VERSION = '${version}';
export default VERSION;
`;

fs.writeFileSync(versionJsPath, versionJsContent);
console.log(`✅ Updated src/config/version.js`);

console.log(`\n🎉 Version ${version} updated successfully!`);
console.log(`\nTo commit: git add . && git commit -m "Update to v${version}" && git push`); 