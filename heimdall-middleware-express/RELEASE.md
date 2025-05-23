# Release Guide - Heimdall Middleware Express

This document contains instructions for releasing and publishing the `@luismr/heimdall-middleware-express` package to GitHub Packages.

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
cd heimdall-middleware-express

# Install dependencies
npm install

# Build the project
npm run build

# Publish to GitHub Packages
npm publish
```

### Automated Publishing with GitHub Actions

The repository can include a GitHub Actions workflow that automatically publishes when you create tags.

Create `.github/workflows/publish-middleware.yml`:

```yaml
name: Publish heimdall-middleware-express

on:
  push:
    tags:
      - 'middleware-v*'
  workflow_dispatch:

jobs:
  publish:
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
          cd heimdall-middleware-express
          npm ci
      
      - name: Build package
        run: |
          cd heimdall-middleware-express
          npm run build
      
      - name: Publish to GitHub Packages
        run: |
          cd heimdall-middleware-express
          npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Trigger automated publishing

```bash
# Update version and create tag
npm version patch  # or minor/major
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
3. **Build the project** - `npm run build`
4. **Update version** - `npm version [patch|minor|major]`
5. **Push changes** - `git push origin main --tags`
6. **Publish** - `npm publish` (manual) or wait for GitHub Actions

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
  - [ ] All tests pass
  - [ ] Code is properly documented
  - [ ] TypeScript compilation succeeds
  - [ ] No linting errors

- [ ] **Documentation**
  - [ ] README.md is up to date
  - [ ] API documentation reflects changes
  - [ ] Changelog is updated
  - [ ] Breaking changes are documented

- [ ] **Version Management**
  - [ ] Version number follows semantic versioning
  - [ ] Git tags are created
  - [ ] Release notes are prepared

- [ ] **Testing**
  - [ ] Package installs correctly
  - [ ] All middleware functions work as expected
  - [ ] JWT validation works properly
  - [ ] Role-based access control functions correctly

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
npm install @luismr/heimdall-middleware-express
```

#### Build Failures

```bash
# Error: TypeScript compilation failed
# Solution: Check TypeScript configuration and fix errors
npm run build
```

### Checking Published Versions

```bash
# List all published versions
npm view @luismr/heimdall-middleware-express versions --json

# Check latest version info
npm view @luismr/heimdall-middleware-express

# Check specific version
npm view @luismr/heimdall-middleware-express@0.0.1
```

## Rollback Process

If you need to unpublish or rollback a version:

```bash
# Unpublish specific version (within 24 hours)
npm unpublish @luismr/heimdall-middleware-express@1.0.0

# Deprecate a version (recommended instead of unpublish)
npm deprecate @luismr/heimdall-middleware-express@1.0.0 "This version has critical bugs, please upgrade"
```

> **Note**: Unpublishing is only allowed within 24 hours and may break dependencies. Consider deprecating instead.

## Security Considerations

- **Never commit** `.npmrc` files with tokens to version control
- **Use environment variables** for sensitive information
- **Rotate tokens** regularly for security
- **Review dependencies** for vulnerabilities before releasing
- **Test authentication** in isolated environments

## Changelog

### [0.0.1] - 2024-01-01
- Initial release
- Basic JWT authentication middleware
- Role-based access control
- TypeScript support

---

*For usage documentation, see [README.md](README.md)* 