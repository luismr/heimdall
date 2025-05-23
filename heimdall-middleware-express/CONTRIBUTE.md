# Contributing to Heimdall Middleware Express

Thank you for your interest in contributing to Heimdall Middleware Express! This document provides guidelines and information for contributors.

## 🚀 Quick Start for Contributors

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Build and test**: `npm run build`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## 📋 Development Workflow

### Setting Up Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/heimdall.git
cd heimdall/heimdall-middleware-express

# Add upstream remote
git remote add upstream https://github.com/luismr/heimdall.git

# Install dependencies
npm install

# Build the project
npm run build
```

### Making Changes

1. **Create a feature branch** from `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards

3. **Test your changes**:
   ```bash
   npm run build
   # Add any additional testing steps
   ```

4. **Commit your changes** with a descriptive message:
   ```bash
   git add .
   git commit -m "feat: add new authentication method"
   ```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```bash
git commit -m "feat: add role-based middleware for moderators"
git commit -m "fix: handle undefined roles in isRole function"
git commit -m "docs: update API reference for requireAuth"
```

## 🛠️ Coding Standards

### TypeScript Guidelines

- **Use TypeScript** for all new code
- **Enable strict mode** in TypeScript configuration
- **Provide type definitions** for all public APIs
- **Use meaningful variable names** and function names
- **Add JSDoc comments** for public methods

### Code Style

- **Use 2 spaces** for indentation
- **Use single quotes** for strings
- **Add semicolons** at the end of statements
- **Use camelCase** for variables and functions
- **Use PascalCase** for types and interfaces

### Example Code Style

```typescript
/**
 * Validates JWT token and extracts user information
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  
  // ... rest of implementation
}
```

## 🧪 Testing Guidelines

### Test Requirements

- **Write tests** for new features
- **Update tests** when modifying existing functionality
- **Ensure tests pass** before submitting PR
- **Test edge cases** and error conditions

### Test Structure

```typescript
describe('requireAuth middleware', () => {
  it('should authenticate valid JWT token', () => {
    // Test implementation
  });
  
  it('should reject invalid JWT token', () => {
    // Test implementation
  });
  
  it('should handle missing authorization header', () => {
    // Test implementation
  });
});
```

## 📚 Documentation

### Documentation Requirements

- **Update README.md** if adding new features
- **Add JSDoc comments** for all public methods
- **Include code examples** for new functionality
- **Update API reference** section when needed

### Documentation Style

- **Use clear, concise language**
- **Include practical examples**
- **Document parameters and return values**
- **Explain error conditions**

## 🔍 Pull Request Process

### Before Submitting

- [ ] **Code builds successfully** (`npm run build`)
- [ ] **All tests pass** (when implemented)
- [ ] **Documentation is updated**
- [ ] **Commit messages follow convention**
- [ ] **No merge conflicts** with main branch

### Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] Documentation updated

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or marked as such)
```

### Review Process

1. **Automated checks** must pass
2. **At least one maintainer** review required
3. **Address feedback** promptly
4. **Squash commits** if requested
5. **Maintainer will merge** when approved

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** for duplicates
2. **Test with latest version**
3. **Provide minimal reproduction** example

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Node.js version: 
- Express version:
- Package version:
- OS:

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Suggesting Features

1. **Check existing issues** for similar requests
2. **Provide clear use case** and rationale
3. **Consider backward compatibility**
4. **Discuss implementation approach**

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other approaches you've considered

**Additional Context**
Any other relevant information
```

## 🚨 Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:
- **Email the maintainer** directly
- **Provide detailed description** of the issue
- **Include steps to reproduce** if possible
- **Allow reasonable time** for response and fix

### Security Guidelines

- **Validate all inputs** thoroughly
- **Use secure defaults** in configurations
- **Follow OWASP guidelines** for web security
- **Keep dependencies updated**

## 📞 Getting Help

### Support Channels

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Email** - For security issues and private matters

### Community Guidelines

- **Be respectful** and professional
- **Help others** when possible
- **Search before asking** questions
- **Provide context** when asking for help

## 🎯 Development Roadmap

### Current Priorities

- [ ] Add comprehensive testing suite
- [ ] Improve error handling
- [ ] Add more authentication methods
- [ ] Performance optimizations
- [ ] Better TypeScript types

### Future Enhancements

- [ ] Support for multiple JWT secrets
- [ ] Rate limiting middleware
- [ ] Session management
- [ ] OAuth integration
- [ ] Audit logging

---

**Thank you for contributing to Heimdall Middleware Express! 🛡️**

*For build and development setup, see [BUILD.md](BUILD.md)*
*For release information, see [RELEASE.md](RELEASE.md)* 