#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
  log(`\n${colors.cyan}${step}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Check if we're in a git repository
function checkGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if there are uncommitted changes
function hasUncommittedChanges() {
  try {
    const result = execSync('git status --porcelain', { encoding: 'utf8' });
    return result.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// Get current git branch
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

// Get current version from package.json
function getCurrentVersion() {
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

// Run command with error handling
function runCommand(command, description) {
  try {
    logInfo(`Running: ${command}`);
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    logSuccess(description);
    return true;
  } catch (error) {
    logError(`Failed: ${description}`);
    logError(`Command: ${command}`);
    return false;
  }
}

// Validate release prerequisites
function validatePrerequisites() {
  logStep('Validating release prerequisites...');

  // Check if we're in a git repository
  if (!checkGitRepo()) {
    logError('Not in a git repository. Please run this script from a git repository.');
    return false;
  }

  // Check for uncommitted changes
  if (hasUncommittedChanges()) {
    logWarning('You have uncommitted changes. Please commit or stash them before releasing.');
    logInfo('Run: git status to see uncommitted changes');
    logInfo('Run: git add . && git commit -m "your message" to commit changes');
    logInfo('Run: git stash to temporarily stash changes');
    return false;
  }

  // Check if we're on main/master branch
  const currentBranch = getCurrentBranch();
  if (currentBranch !== 'main' && currentBranch !== 'master') {
    logWarning(`You're on branch '${currentBranch}'. Consider switching to main/master for releases.`);
    logInfo('Run: git checkout main (or master) to switch to main branch');
  }

  logSuccess('Prerequisites validated');
  return true;
}

// Build the project
function buildProject() {
  logStep('Building project...');
  return runCommand('npm run build', 'Project built successfully');
}

// Update version
function updateVersion(bumpType) {
  logStep(`Updating version (${bumpType})...`);
  return runCommand(`npm run version:${bumpType}`, 'Version updated successfully');
}

// Commit changes
function commitChanges(version) {
  logStep('Committing changes...');
  const commitMessage = `Release v${version}`;
  return runCommand(`git add .`, 'Files staged') &&
         runCommand(`git commit -m "${commitMessage}"`, 'Changes committed');
}

// Create git tag
function createTag(version) {
  logStep('Creating git tag...');
  return runCommand(`git tag v${version}`, 'Git tag created');
}

// Push changes and tags
function pushChanges() {
  logStep('Pushing changes and tags...');
  const currentBranch = getCurrentBranch();
  return runCommand(`git push origin ${currentBranch}`, 'Changes pushed') &&
         runCommand('git push --tags', 'Tags pushed');
}

// Generate release notes
function generateReleaseNotes(version, bumpType) {
  logStep('Generating release notes...');
  
  try {
    // Get recent commits since last tag
    const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    const commits = execSync(`git log ${lastTag}..HEAD --oneline`, { encoding: 'utf8' });
    
    const releaseNotesPath = path.join(__dirname, `../RELEASE_NOTES_${version}.md`);
    const releaseNotes = `# Release v${version}

## Release Type
${bumpType.charAt(0).toUpperCase() + bumpType.slice(1)} Release

## Release Date
${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

## Changes Since Last Release
${commits.split('\n').filter(line => line.trim()).map(commit => `- ${commit}`).join('\n')}

## Build Information
- Version: ${version}
- Build Date: ${new Date().toISOString()}
- Git Branch: ${getCurrentBranch()}
- Git Commit: ${execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()}

## Installation
\`\`\`bash
npm install
npm run build
\`\`\`

## Development
\`\`\`bash
npm run dev
\`\`\`
`;

    fs.writeFileSync(releaseNotesPath, releaseNotes);
    logSuccess(`Release notes generated: RELEASE_NOTES_${version}.md`);
    return true;
  } catch (error) {
    logWarning('Could not generate release notes');
    return false;
  }
}

// Main release function
function performRelease(bumpType) {
  const currentVersion = getCurrentVersion();
  
  log(`${colors.bright}🚀 Starting release process...${colors.reset}`);
  log(`Current version: ${colors.yellow}${currentVersion}${colors.reset}`);
  log(`Release type: ${colors.yellow}${bumpType}${colors.reset}`);
  
  // Validate prerequisites
  if (!validatePrerequisites()) {
    process.exit(1);
  }

  // Build project
  if (!buildProject()) {
    logError('Build failed. Aborting release.');
    process.exit(1);
  }

  // Update version
  if (!updateVersion(bumpType)) {
    logError('Version update failed. Aborting release.');
    process.exit(1);
  }

  // Get new version
  const newVersion = getCurrentVersion();

  // Commit changes
  if (!commitChanges(newVersion)) {
    logError('Commit failed. Aborting release.');
    process.exit(1);
  }

  // Create tag
  if (!createTag(newVersion)) {
    logError('Tag creation failed. Aborting release.');
    process.exit(1);
  }

  // Push changes
  if (!pushChanges()) {
    logError('Push failed. Please push manually:');
    logInfo(`git push origin ${getCurrentBranch()}`);
    logInfo('git push --tags');
    process.exit(1);
  }

  // Generate release notes
  generateReleaseNotes(newVersion, bumpType);

  // Success message
  log(`\n${colors.bright}${colors.green}🎉 Release v${newVersion} completed successfully!${colors.reset}`);
  log(`\n${colors.cyan}What happened:${colors.reset}`);
  log(`  ✅ Project built successfully`);
  log(`  ✅ Version updated from ${currentVersion} to ${newVersion}`);
  log(`  ✅ Changes committed to git`);
  log(`  ✅ Git tag v${newVersion} created`);
  log(`  ✅ Changes and tags pushed to remote repository`);
  log(`  ✅ Release notes generated`);
  
  log(`\n${colors.cyan}Next steps:${colors.reset}`);
  log(`  📋 Review the release on GitHub`);
  log(`  📋 Update any deployment configurations`);
  log(`  📋 Notify team members of the new release`);
  
  log(`\n${colors.yellow}Release v${newVersion} is now live! 🚀${colors.reset}`);
}

// CLI argument handling
const bumpType = process.argv[2];

if (!bumpType || !['patch', 'minor', 'major'].includes(bumpType)) {
  log('Usage: node scripts/release.js <patch|minor|major>', 'red');
  log('');
  log('Release types:', 'cyan');
  log('  patch  - Bug fixes and minor updates (1.0.0 -> 1.0.1)');
  log('  minor  - New features, backward compatible (1.0.0 -> 1.1.0)');
  log('  major  - Breaking changes (1.0.0 -> 2.0.0)');
  log('');
  log('Current version:', 'yellow');
  log(`  ${getCurrentVersion()}`);
  log('');
  log('Examples:', 'cyan');
  log('  node scripts/release.js patch  # For bug fixes');
  log('  node scripts/release.js minor  # For new features');
  log('  node scripts/release.js major  # For breaking changes');
  process.exit(1);
}

performRelease(bumpType); 