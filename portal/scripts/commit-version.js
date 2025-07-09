#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Run command with error handling
function runCommand(command, description) {
  try {
    logInfo(`Running: ${command}`);
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    logSuccess(description);
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    console.error(`Command: ${command}`);
    return false;
  }
}

// Main commit function
function commitVersion() {
  log('🚀 Committing version changes to GitHub...', 'cyan');
  
  // Add all changes
  if (!runCommand('git add .', 'Files staged')) {
    return false;
  }

  // Commit changes
  if (!runCommand('git commit -m "Update version to v0.7.2.2"', 'Changes committed')) {
    return false;
  }

  // Push changes
  if (!runCommand('git push', 'Changes pushed to GitHub')) {
    return false;
  }

  log('\n🎉 Version changes successfully committed and pushed to GitHub!', 'green');
  log('\nWhat was done:', 'cyan');
  log('  ✅ Updated version to v0.7.2.2');
  log('  ✅ Updated src/config/version.js');
  log('  ✅ Updated index.html');
  log('  ✅ Committed changes to git');
  log('  ✅ Pushed to GitHub');
  
  return true;
}

// Run the commit
commitVersion(); 