# IDAIC Portal Release Guide

This guide explains how to use the automated version management and release system for the IDAIC Portal.

## Overview

The portal uses semantic versioning (SemVer) with automated scripts to handle version updates, building, and deployment to GitHub.

## Version Management

### Current Version
The current version is managed in multiple places:
- `package.json` - Main version number
- `src/config/version.js` - Auto-generated version configuration
- `index.html` - Version meta tag
- `src/App.jsx` - Version import for runtime access

### Version Types

1. **Patch** (1.0.0 → 1.0.1)
   - Bug fixes
   - Minor updates
   - Security patches

2. **Minor** (1.0.0 → 1.1.0)
   - New features
   - Backward compatible changes
   - UI improvements

3. **Major** (1.0.0 → 2.0.0)
   - Breaking changes
   - Major feature additions
   - Architecture changes

## Release Commands

### Quick Release (Patch)
```bash
npm run release
```
This is the most common command for regular updates and bug fixes.

### Minor Release
```bash
npm run release:minor
```
Use for new features that are backward compatible.

### Major Release
```bash
npm run release:major
```
Use for breaking changes or major version updates.

### Version Only (No Release)
```bash
npm run version:patch    # Update version only
npm run version:minor    # Update version only
npm run version:major    # Update version only
```

### Dry Run
```bash
npm run release:dry-run
```
Build and update version without committing or pushing.

## Release Process

When you run a release command, the following happens automatically:

1. **Validation**
   - Checks if you're in a git repository
   - Verifies no uncommitted changes
   - Warns if not on main/master branch

2. **Build**
   - Runs `npm run build`
   - Ensures the project builds successfully

3. **Version Update**
   - Updates version in `package.json`
   - Creates/updates `src/config/version.js`
   - Updates version in `index.html`
   - Updates version in `src/App.jsx`

4. **Git Operations**
   - Stages all changes
   - Commits with message "Release vX.Y.Z"
   - Creates git tag `vX.Y.Z`
   - Pushes changes to remote repository
   - Pushes tags to remote repository

5. **Release Notes**
   - Generates `RELEASE_NOTES_X.Y.Z.md`
   - Includes commit history since last release
   - Includes build information

## Prerequisites

Before running a release:

1. **Ensure you're on the correct branch**
   ```bash
   git checkout main  # or master
   ```

2. **Commit or stash any changes**
   ```bash
   git status  # Check for uncommitted changes
   git add . && git commit -m "your message"  # Commit changes
   # OR
   git stash  # Stash changes temporarily
   ```

3. **Verify remote repository access**
   ```bash
   git remote -v  # Check remote URLs
   ```

## Manual Release Steps

If you prefer to release manually:

1. **Update version**
   ```bash
   npm run version:patch  # or minor/major
   ```

2. **Build project**
   ```bash
   npm run build
   ```

3. **Commit and tag**
   ```bash
   git add .
   git commit -m "Release v$(node -p "require('./package.json').version")"
   git tag v$(node -p "require('./package.json').version")
   ```

4. **Push changes**
   ```bash
   git push
   git push --tags
   ```

## Version Configuration

The version system automatically manages these files:

### `src/config/version.js`
```javascript
export const VERSION = '1.0.0';
export const BUILD_DATE = '2024-01-01T00:00:00.000Z';
export const BUILD_ENV = 'production';
export const VERSION_INFO = {
  version: VERSION,
  buildDate: BUILD_DATE,
  buildEnv: BUILD_ENV,
  gitCommit: 'abc123...',
  gitBranch: 'main'
};
```

### `index.html`
```html
<meta name="version" content="1.0.0">
```

### `src/App.jsx`
```javascript
import { VERSION } from './config/version.js';
// VERSION is now available for use in the app
```

## Troubleshooting

### Common Issues

1. **"Not in a git repository"**
   - Ensure you're in the portal directory
   - Run `git init` if needed

2. **"You have uncommitted changes"**
   - Commit or stash your changes first
   - Use `git status` to see what's changed

3. **"Build failed"**
   - Fix any build errors before releasing
   - Run `npm run build` manually to debug

4. **"Push failed"**
   - Check your git remote configuration
   - Ensure you have push permissions
   - Try pushing manually: `git push origin main`

### Rollback

If you need to rollback a release:

1. **Delete the tag locally**
   ```bash
   git tag -d v1.0.1
   ```

2. **Delete the tag remotely**
   ```bash
   git push origin :refs/tags/v1.0.1
   ```

3. **Reset to previous commit**
   ```bash
   git reset --hard HEAD~1
   git push --force origin main
   ```

## Best Practices

1. **Always test before releasing**
   - Run `npm run build` to ensure everything works
   - Test the built version locally

2. **Use meaningful commit messages**
   - The release script uses "Release vX.Y.Z"
   - Add detailed commit messages for your changes

3. **Review release notes**
   - Check the generated `RELEASE_NOTES_X.Y.Z.md`
   - Update if needed with additional context

4. **Communicate releases**
   - Notify team members of new releases
   - Update deployment configurations if needed

5. **Keep main branch clean**
   - Always release from main/master branch
   - Use feature branches for development

## CI/CD Integration

The release system can be integrated with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Release
  run: |
    npm run release:patch
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Support

For issues with the release system:
1. Check this guide first
2. Review the script files in `scripts/`
3. Check git status and logs
4. Contact the development team 