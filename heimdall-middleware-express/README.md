# Heimdall Middleware Express

[![npm version](https://badge.fury.io/js/%40luismr%2Fheimdall-middleware-express.svg)](https://badge.fury.io/js/%40luismr%2Fheimdall-middleware-express)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.19.x-green?logo=express)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![JsonWebToken](https://img.shields.io/badge/JsonWebToken-9.0.x-orange?logo=jsonwebtokens)](https://github.com/auth0/node-jsonwebtoken)

A lightweight authentication and authorization middleware library for Express.js applications. Heimdall provides JWT-based authentication with role-based access control.

## Features

- 🔐 **JWT Authentication**: Secure token-based authentication
- 👥 **Role-Based Access Control**: Fine-grained permission management
- 🚀 **Express Integration**: Seamless middleware integration
- 📦 **TypeScript Support**: Full TypeScript definitions included
- 🛡️ **Security First**: Built with security best practices

## Installation

### From GitHub Packages

```bash
npm install @luismr/heimdall-middleware-express
```

### Setup Authentication for GitHub Packages

Create a `.npmrc` file in your project root:

```npmrc
@luismr:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Replace `YOUR_GITHUB_TOKEN` with a GitHub Personal Access Token that has `read:packages` permission.

## Quick Start

```typescript
import express from 'express';
import { requireAuth, requireAdmin, AuthRequest } from '@luismr/heimdall-middleware-express';

const app = express();

// Protected route - requires valid JWT
app.get('/profile', requireAuth, (req: AuthRequest, res) => {
  res.json({ message: 'Access granted!', user: req.user });
});

// Admin only route
app.get('/admin/users', requireAdmin, (req: AuthRequest, res) => {
  res.json({ message: 'Admin access granted!', user: req.user });
});

app.listen(3000);
```

👆 **That's it!** For complete setup instructions, examples, and advanced usage, see [QUICKSTART.md](QUICKSTART.md).

## API Reference

### Middleware Functions

#### `requireAuth(req: AuthRequest, res: Response, next: NextFunction)`

Validates JWT token from the Authorization header and adds user information to the request object.

**Headers Required:**
```
Authorization: Bearer <your-jwt-token>
```

**Usage:**
```typescript
app.get('/protected', requireAuth, (req: AuthRequest, res) => {
  // req.user contains decoded JWT payload
  console.log(req.user);
});
```

#### `requireAdmin(req: AuthRequest, res: Response, next: NextFunction)`

Combines authentication with admin role verification. Requires the user to have `ROLE_ADMIN` in their roles array.

**Usage:**
```typescript
app.delete('/users/:id', requireAdmin, (req: AuthRequest, res) => {
  // Only admins can access this route
});
```

### Utility Functions

#### `isRole(req: AuthRequest, ...roles: string[]): boolean`

Checks if the authenticated user has any of the specified roles.

**Usage:**
```typescript
app.get('/dashboard', requireAuth, (req: AuthRequest, res) => {
  if (isRole(req, 'ROLE_ADMIN', 'ROLE_MODERATOR')) {
    // User has admin or moderator role
    res.json({ adminPanel: true });
  } else {
    res.json({ adminPanel: false });
  }
});
```

### Types

#### `AuthRequest`

Extends Express Request with optional user property:

```typescript
interface AuthRequest extends Request {
  user?: any; // Decoded JWT payload
}
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for JWT verification | `supersecret` | No* |

> ⚠️ **Important**: Always set `JWT_SECRET` in production environments!

### JWT Token Format

Your JWT tokens should include a `roles` array for role-based access control:

```json
{
  "sub": "user123",
  "email": "user@example.com",
  "roles": ["ROLE_USER", "ROLE_ADMIN"],
  "iat": 1640995200,
  "exp": 1641081600
}
```

## Error Responses

The middleware returns standard HTTP error responses:

### 401 Unauthorized
```json
{ "error": "Missing or invalid Authorization header" }
{ "error": "Invalid or expired token" }
```

### 403 Forbidden
```json
{ "error": "Admin role required" }
```

## Documentation

- **🚀 Quick Start & Examples** - See [QUICKSTART.md](QUICKSTART.md)
- **🔧 Development & Build Setup** - See [BUILD.md](BUILD.md)
- **🤝 Contributing Guidelines** - See [CONTRIBUTE.md](CONTRIBUTE.md)
- **📦 Release Information** - See [RELEASE.md](RELEASE.md)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Security

If you discover a security vulnerability, please send an e-mail to the repository owner. All security vulnerabilities will be promptly addressed.

---

**Made with ❤️ for secure Express.js applications**