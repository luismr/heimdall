# Release Guide - Heimdall Client

This document contains instructions for releasing and publishing the `@luismr/heimdall-client` package to GitHub Packages.

## Prerequisites

1. **GitHub Personal Access Token** with `write:packages` permission
2. **Repository access** to https://github.com/luismr/heimdall
3. **Maintainer permissions** on the repository

## Publishing to GitHub Packages

### Manual Publishing

#### 1. Set up authentication

Create `.npmrc` file in the package directory:

```bash
# Create .npmrc file
echo "@luismr:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Export your GitHub token
export GITHUB_TOKEN=your_personal_access_token_here
```

#### 2. Build and publish

```bash
# Navigate to package directory
cd heimdall-client

# Install dependencies
npm install

# Build the project
npm run build

# Run tests to ensure everything works
npm test

# Publish to GitHub Packages
npm publish
```

### Automated Publishing with GitHub Actions

The repository can include a GitHub Actions workflow that automatically publishes when you create tags.

Create `.github/workflows/publish-client.yml`:

```yaml
name: Publish heimdall-client

on:
  push:
    tags:
      - 'client-v*'
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'heimdall-client/package-lock.json'
      
      - name: Install dependencies
        run: |
          cd heimdall-client
          npm ci
      
      - name: Run tests
        run: |
          cd heimdall-client
          npm test
      
      - name: Run linting
        run: |
          cd heimdall-client
          npm run lint

  publish:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@luismr'
      
      - name: Install dependencies
        run: |
          cd heimdall-client
          npm ci
      
      - name: Build package
        run: |
          cd heimdall-client
          npm run build
      
      - name: Publish to GitHub Packages
        run: |
          cd heimdall-client
          npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Trigger automated publishing

```bash
# Update version and create tag
cd heimdall-client
npm version patch  # or minor/major
git add .
git commit -m "chore: bump client version to $(node -p "require('./package.json').version")"
git tag "client-v$(node -p "require('./package.json').version")"
git push origin main --tags
```

## Version Management

Follow semantic versioning principles:

### Version Types

- **Patch** (`npm version patch`): Bug fixes (1.0.0 → 1.0.1)
- **Minor** (`npm version minor`): New features, backward compatible (1.0.0 → 1.1.0)  
- **Major** (`npm version major`): Breaking changes (1.0.0 → 2.0.0)

### Release Process

1. **Update the code** with your changes
2. **Test thoroughly** - ensure all functionality works
   ```bash
   npm test
   npm run test:coverage
   npm run lint
   ```
3. **Build the project** - `npm run build`
4. **Update version** - `npm version [patch|minor|major]`
5. **Update documentation** - Update CHANGELOG.md with new features/fixes
6. **Push changes** - `git push origin main --tags`
7. **Publish** - `npm publish` (manual) or wait for GitHub Actions

### Pre-release Versions

For beta or alpha releases:

```bash
# Create pre-release version
npm version prerelease --preid=beta  # 1.0.0-beta.0
npm version prerelease --preid=alpha # 1.0.0-alpha.0

# Publish with tag
npm publish --tag beta
npm publish --tag alpha
```

## Release Checklist

Before releasing a new version:

- [ ] **Code Quality**
  - [ ] All tests pass (`npm test`)
  - [ ] Code coverage is acceptable (`npm run test:coverage`)
  - [ ] No linting errors (`npm run lint`)
  - [ ] TypeScript compilation succeeds (`npm run build`)
  - [ ] All TypeScript types are properly exported

- [ ] **API Compatibility**
  - [ ] All Heimdall server endpoints are supported
  - [ ] Error handling is comprehensive
  - [ ] Authentication context management works correctly
  - [ ] All admin operations function properly

- [ ] **Documentation**
  - [ ] README.md is up to date
  - [ ] QUICKSTART.md reflects current API
  - [ ] API documentation is accurate
  - [ ] Breaking changes are documented
  - [ ] Usage examples are tested

- [ ] **Dependencies**
  - [ ] All dependencies are up to date
  - [ ] No security vulnerabilities (`npm audit`)
  - [ ] Package size is reasonable

- [ ] **Testing**
  - [ ] Package installs correctly
  - [ ] All client methods work as expected
  - [ ] Error handling works properly
  - [ ] Authentication flow is complete
  - [ ] Admin operations require proper permissions

## Release Notes Template

When creating a new release, use this template for release notes:

```markdown
# @luismr/heimdall-client v1.0.0

## 🚀 Features
- New feature descriptions
- API enhancements

## 🐛 Bug Fixes
- Bug fix descriptions
- Error handling improvements

## 💥 Breaking Changes
- Breaking change descriptions
- Migration instructions

## 📦 Dependencies
- Dependency updates
- Security patches

## 📖 Documentation
- Documentation improvements
- New examples

## 🏗️ Internal
- Build improvements
- Test enhancements

## Migration Guide

### From v0.x.x to v1.0.0

```typescript
// Before
const client = new HeimdallClient(baseURL);

// After
const client = new HeimdallClient({ baseURL });
```

## Contributors
- @username
```

## Changelog Management

Maintain a `CHANGELOG.md` file following the [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features that haven't been released yet

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Now removed features

### Fixed
- Bug fixes

### Security
- Vulnerability fixes

## [1.0.0] - 2024-01-15

### Added
- Initial release of Heimdall client
- Full authentication support (signup, login, logout)
- Admin operations (block, unblock, remove users)
- TypeScript support with comprehensive types
- Automatic token management
- Custom error handling with HeimdallError
- Comprehensive test coverage

### Security
- Secure token handling
- HTTPS support
- Input validation
```

## Troubleshooting

### Common Issues

#### Authentication Errors

```bash
# Error: 401 Unauthorized
# Solution: Check your GitHub token has write:packages permission
export GITHUB_TOKEN=your_valid_token_here
```

#### Package Not Found

```bash
# Error: Package not found
# Solution: Ensure the package name and scope are correct
npm install @luismr/heimdall-client
```

#### Build Failures

```bash
# Error: TypeScript compilation failed
# Solution: Check TypeScript configuration and fix errors
npm run build

# Check for type errors
npx tsc --noEmit
```

#### Test Failures

```bash
# Error: Tests failing
# Solution: Run tests and fix issues
npm test

# Run tests in watch mode for development
npm run test:watch

# Check test coverage
npm run test:coverage
```

### Checking Published Versions

```bash
# List all published versions
npm view @luismr/heimdall-client versions --json

# Check latest version info
npm view @luismr/heimdall-client

# Check specific version
npm view @luismr/heimdall-client@1.0.0

# Check package dependencies
npm view @luismr/heimdall-client dependencies
```

### Package Verification

After publishing, verify the package works correctly:

```bash
# Create a test project
mkdir test-heimdall-client
cd test-heimdall-client
npm init -y

# Configure .npmrc for GitHub packages
echo "@luismr:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Install your published package
npm install @luismr/heimdall-client

# Test basic import
node -e "const { HeimdallClient } = require('@luismr/heimdall-client'); console.log('Import successful');"
```

## Security Considerations

### Token Management

- Never commit GitHub tokens to version control
- Use environment variables for CI/CD
- Rotate tokens regularly
- Use minimum required permissions

### Package Security

- Run security audits before publishing
- Keep dependencies updated
- Use lock files for reproducible builds
- Validate inputs in the client code

```bash
# Security checks before release
npm audit
npm audit fix

# Check for outdated dependencies
npm outdated

# Update dependencies
npm update
```

## Deployment Environments

### Development

```bash
# Local development setup
git clone https://github.com/luismr/heimdall.git
cd heimdall/heimdall-client
npm install
npm run dev
```

### Staging

```bash
# Staging release (pre-release)
npm version prerelease --preid=rc
npm publish --tag next
```

### Production

```bash
# Production release
npm version minor
npm publish
# Tag will be 'latest' by default
```

---

**📦 Remember**: Always test your package thoroughly before publishing, and maintain clear documentation for users upgrading between versions. 