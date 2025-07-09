#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target version
const TARGET_VERSION = '0.7.2.2';

// Files to update
const FILES_TO_UPDATE = [
  {
    path: '../src/config/version.js',
    type: 'js',
    pattern: /export const VERSION = ['"`]([^'"`]+)['"`];/,
    replacement: "export const VERSION = '$VERSION';"
  },
  {
    path: '../index.html',
    type: 'html',
    pattern: /<meta name="version" content="([^"]+)"/,
    replacement: '<meta name="version" content="$VERSION"'
  }
];

// Create version config file
function createVersionConfig() {
  const versionConfigPath = path.join(__dirname, '../src/config/version.js');
  const versionConfigDir = path.dirname(versionConfigPath);
  
  if (!fs.existsSync(versionConfigDir)) {
    fs.mkdirSync(versionConfigDir, { recursive: true });
  }
  
  const versionConfig = `// Auto-generated version configuration
// This file is updated automatically by the version script

export const VERSION = '${TARGET_VERSION}';
export const BUILD_DATE = '${new Date().toISOString()}';
export const BUILD_ENV = process.env.NODE_ENV || 'development';

// Version information for the application
export const VERSION_INFO = {
  version: VERSION,
  buildDate: BUILD_DATE,
  buildEnv: BUILD_ENV,
  gitCommit: process.env.GIT_COMMIT || 'unknown',
  gitBranch: process.env.GIT_BRANCH || 'unknown'
};

export default VERSION;
`;

  fs.writeFileSync(versionConfigPath, versionConfig);
  console.log(`✅ Created/Updated version config: ${versionConfigPath}`);
}

// Update version in files
function updateFileVersion(filePath, pattern, replacement) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(pattern);
  
  if (match) {
    content = content.replace(pattern, replacement.replace('$VERSION', TARGET_VERSION));
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath} version to ${TARGET_VERSION}`);
  } else {
    // For HTML files, add version meta tag if it doesn't exist
    if (filePath.includes('index.html') && content.includes('</head>')) {
      const versionMeta = `    <meta name="version" content="${TARGET_VERSION}">\n`;
      content = content.replace('</head>', versionMeta + '  </head>');
      fs.writeFileSync(filePath, content);
      console.log(`✅ Added version meta tag to ${filePath}: ${TARGET_VERSION}`);
    } else {
      console.log(`⚠️  Version pattern not found in ${filePath}`);
    }
  }
}

// Main update function
function updateVersion() {
  console.log(`🔄 Updating version to ${TARGET_VERSION}`);
  console.log('');

  // Create/update version config
  createVersionConfig();

  // Update other files
  FILES_TO_UPDATE.forEach(file => {
    const filePath = path.join(__dirname, file.path);
    updateFileVersion(filePath, file.pattern, file.replacement);
  });

  console.log('');
  console.log(`🎉 Version updated successfully to ${TARGET_VERSION}`);
  console.log('');
  console.log('Files updated:');
  console.log('  ✅ src/config/version.js');
  console.log('  ✅ index.html');
  console.log('');
  console.log('You can now commit and push these changes to GitHub.');
}

// Run the update
updateVersion(); 