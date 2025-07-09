#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for files that contain version information
const VERSION_FILES = [
  {
    path: '../package.json',
    type: 'json',
    versionPath: 'version'
  },
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
  },
  {
    path: '../src/App.jsx',
    type: 'jsx',
    pattern: /const APP_VERSION = ['"`]([^'"`]+)['"`];/,
    replacement: "const APP_VERSION = '$VERSION';"
  }
];

// Version bump types
const VERSION_TYPES = {
  patch: (version) => {
    const [major, minor, patch] = version.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  },
  minor: (version) => {
    const [major, minor, patch] = version.split('.').map(Number);
    return `${major}.${minor + 1}.0`;
  },
  major: (version) => {
    const [major, minor, patch] = version.split('.').map(Number);
    return `${major + 1}.0.0`;
  }
};

// Get current version from package.json
function getCurrentVersion() {
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

// Update version in package.json
function updatePackageVersion(newVersion) {
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated package.json version to ${newVersion}`);
}

// Update version in JavaScript/JSX files
function updateJSVersion(filePath, newVersion, pattern, replacement) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(pattern);
  
  if (match) {
    content = content.replace(pattern, replacement.replace('$VERSION', newVersion));
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath} version to ${newVersion}`);
  } else {
    console.log(`⚠️  Version pattern not found in ${filePath}`);
  }
}

// Update version in HTML files
function updateHTMLVersion(filePath, newVersion, pattern, replacement) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(pattern);
  
  if (match) {
    content = content.replace(pattern, replacement.replace('$VERSION', newVersion));
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath} version to ${newVersion}`);
  } else {
    // Add version meta tag if it doesn't exist
    if (content.includes('</head>')) {
      const versionMeta = `    <meta name="version" content="${newVersion}">\n`;
      content = content.replace('</head>', versionMeta + '  </head>');
      fs.writeFileSync(filePath, content);
      console.log(`✅ Added version meta tag to ${filePath}: ${newVersion}`);
    } else {
      console.log(`⚠️  Could not add version meta tag to ${filePath}`);
    }
  }
}

// Create version config file if it doesn't exist
function createVersionConfig(newVersion) {
  const versionConfigPath = path.join(__dirname, '../src/config/version.js');
  const versionConfigDir = path.dirname(versionConfigPath);
  
  if (!fs.existsSync(versionConfigDir)) {
    fs.mkdirSync(versionConfigDir, { recursive: true });
  }
  
  const versionConfig = `// Auto-generated version configuration
// This file is updated automatically by the version script

export const VERSION = '${newVersion}';
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

// Add version to App.jsx if it doesn't exist
function updateAppVersion(newVersion) {
  const appPath = path.join(__dirname, '../src/App.jsx');
  
  if (!fs.existsSync(appPath)) {
    console.log(`⚠️  App.jsx not found: ${appPath}`);
    return;
  }

  let content = fs.readFileSync(appPath, 'utf8');
  
  // Check if version constant already exists
  if (content.includes('APP_VERSION')) {
    content = content.replace(/const APP_VERSION = ['"`][^'"`]+['"`];/, `const APP_VERSION = '${newVersion}';`);
    console.log(`✅ Updated APP_VERSION in App.jsx to ${newVersion}`);
  } else {
    // Add version constant after imports
    const importMatch = content.match(/(import.*?;?\n)/s);
    if (importMatch) {
      const versionLine = `import { VERSION } from './config/version.js';\n`;
      content = content.replace(importMatch[0], importMatch[0] + versionLine);
      console.log(`✅ Added VERSION import to App.jsx`);
    }
  }
  
  fs.writeFileSync(appPath, content);
}

// Main version update function
function updateVersion(bumpType) {
  const currentVersion = getCurrentVersion();
  const newVersion = VERSION_TYPES[bumpType](currentVersion);
  
  console.log(`🔄 Updating version from ${currentVersion} to ${newVersion} (${bumpType})`);
  console.log('');

  // Update package.json
  updatePackageVersion(newVersion);

  // Create/update version config
  createVersionConfig(newVersion);

  // Update App.jsx
  updateAppVersion(newVersion);

  // Update other files
  VERSION_FILES.forEach(file => {
    const filePath = path.join(__dirname, file.path);
    
    if (file.type === 'js' || file.type === 'jsx') {
      updateJSVersion(filePath, newVersion, file.pattern, file.replacement);
    } else if (file.type === 'html') {
      updateHTMLVersion(filePath, newVersion, file.pattern, file.replacement);
    }
  });

  console.log('');
  console.log(`🎉 Version updated successfully to ${newVersion}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Review the changes');
  console.log('2. Run: npm run build');
  console.log('3. Run: npm run release (or release:minor/major)');
  console.log('');
}

// CLI argument handling
const bumpType = process.argv[2];

if (!bumpType || !VERSION_TYPES[bumpType]) {
  console.log('Usage: node scripts/version.js <patch|minor|major>');
  console.log('');
  console.log('Version bump types:');
  console.log('  patch  - Increment patch version (1.0.0 -> 1.0.1)');
  console.log('  minor  - Increment minor version (1.0.0 -> 1.1.0)');
  console.log('  major  - Increment major version (1.0.0 -> 2.0.0)');
  console.log('');
  console.log('Current version:', getCurrentVersion());
  process.exit(1);
}

updateVersion(bumpType); 