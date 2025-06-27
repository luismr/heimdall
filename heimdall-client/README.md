# Heimdall Client

[![npm version](https://badge.fury.io/js/%40luismr%2Fheimdall-client.svg)](https://badge.fury.io/js/%40luismr%2Fheimdall-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Axios](https://img.shields.io/badge/Axios-1.7.x-purple?logo=axios)](https://axios-http.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)

A comprehensive TypeScript client library for consuming Heimdall authentication API endpoints. Provides a simple, type-safe interface for user authentication, authorization, and admin operations with automatic token management.

## Features

- 🔐 **Full Authentication Support**: Complete signup, login, and logout functionality
- 👥 **Admin Operations**: User blocking, unblocking, and removal
- 🛡️ **Type Safety**: Full TypeScript support with comprehensive interfaces
- 🚀 **Easy Integration**: Simple API with automatic token management
- 📦 **Axios-Based**: Built on the reliable Axios HTTP client
- 🔄 **Auto Context Management**: Automatic authentication context handling
- ⚡ **Error Handling**: Comprehensive error handling with custom error types

## Installation

### From GitHub Packages

```bash
npm install @luismr/heimdall-client
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
import { HeimdallClient } from '@luismr/heimdall-client';

// Create client instance with signup protection (recommended)
const client = new HeimdallClient({
  baseURL: 'http://localhost:4000/api', // Your Heimdall server URL
  signupAccessToken: 'your-signup-access-token', // Required for signup
  signupSecretToken: 'your-signup-secret-token', // Required for signup
});

// Register a new user (will only work if tokens are provided)
const user = await client.signup({
  username: 'johndoe',
  password: 'securepassword123'
});

// Login and get tokens
const loginResult = await client.login({
  username: 'johndoe',
  password: 'securepassword123'
});

// Client automatically manages authentication context
console.log(client.isAuthenticated()); // true

// Logout
await client.logout({
  refreshToken: loginResult.refreshToken
});
```

👆 **That's it!** For complete setup instructions, examples, and advanced usage, see [QUICKSTART.md](QUICKSTART.md).

> **Note:** If `signupAccessToken` and `signupSecretToken` are not provided, the `signup` method will be disabled and throw an error.

## API Reference

### Constructor

#### `new HeimdallClient(config: HeimdallClientConfig)`

Creates a new Heimdall client instance.

**Parameters:**
```typescript
interface HeimdallClientConfig {
  baseURL: string;      // Heimdall server base URL
  timeout?: number;     // Request timeout in milliseconds (default: 10000)
  headers?: Record<string, string>; // Additional headers
  signupAccessToken?: string; // Optional: Signup protection access token
  signupSecretToken?: string; // Optional: Signup protection secret token
}
```

**Example:**
```typescript
const client = new HeimdallClient({
  baseURL: 'https://api.example.com/api',
  timeout: 5000,
  headers: { 'X-Client-Version': '1.0.0' },
  signupAccessToken: 'your-signup-access-token',
  signupSecretToken: 'your-signup-secret-token'
});
```

### Authentication Methods

#### `signup(request: SignupRequest): Promise<SignupResponse>`

Register a new user account. Requires signup protection tokens if enabled on the server.

**Request:**
```typescript
interface SignupRequest {
  username: string;
  password: string;
}
```

**Response:**
```typescript
interface SignupResponse {
  username: string;
  roles: string[];
  blocked: boolean;
}
```

**Throws:**
- `HeimdallError` with status 403 if signup protection tokens are not configured in the client.

**Example:**
```typescript
const user = await client.signup({
  username: 'johndoe',
  password: 'securepassword123'
});
console.log(user.roles); // ['ROLE_USER']
```

#### `login(request: LoginRequest): Promise<LoginResponse>`

Authenticate user and get JWT tokens. Automatically sets authentication context.

**Request:**
```typescript
interface LoginRequest {
  username: string;
  password: string;
}
```

**Response:**
```typescript
interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
```

**Example:**
```typescript
const loginResult = await client.login({
  username: 'johndoe',
  password: 'securepassword123'
});

// Authentication context is automatically set
console.log(client.isAuthenticated()); // true
```

#### `logout(request: LogoutRequest): Promise<SuccessResponse>`

Logout user and invalidate refresh token. Automatically clears authentication context.

**Request:**
```typescript
interface LogoutRequest {
  refreshToken: string;
}
```

**Example:**
```typescript
await client.logout({
  refreshToken: loginResult.refreshToken
});

console.log(client.isAuthenticated()); // false
```

### Admin Methods

All admin methods require the user to have `ROLE_ADMIN` role and be authenticated.

#### `blockUser(request: AdminActionRequest): Promise<SuccessResponse>`

Block a user account.

**Example:**
```typescript
await client.blockUser({ username: 'usertoblock' });
```

#### `unblockUser(request: AdminActionRequest): Promise<SuccessResponse>`

Unblock a user account.

**Example:**
```typescript
await client.unblockUser({ username: 'usertounblock' });
```

#### `removeUser(request: AdminActionRequest): Promise<SuccessResponse>`

Remove a user account permanently.

**Example:**
```typescript
await client.removeUser({ username: 'usertoremove' });
```

### Context Management

#### `setAuthContext(context: AuthContext): void`

Manually set authentication context.

```typescript
client.setAuthContext({
  accessToken: 'your-access-token',
  refreshToken: 'your-refresh-token',
  user: { username: 'johndoe', roles: ['ROLE_USER'], blocked: false }
});
```

#### `getAuthContext(): AuthContext`

Get current authentication context.

```typescript
const context = client.getAuthContext();
console.log(context.user?.username);
```

#### `clearAuthContext(): void`

Clear authentication context.

```typescript
client.clearAuthContext();
```

#### `isAuthenticated(): boolean`

Check if client is authenticated.

```typescript
if (client.isAuthenticated()) {
  console.log('User is logged in');
}
```

### Utility Methods

#### `updateBaseURL(baseURL: string): void`

Update the base URL for API requests.

```typescript
client.updateBaseURL('https://new-api.example.com/api');
```

#### `updateHeaders(headers: Record<string, string>): void`

Update default headers.

```typescript
client.updateHeaders({ 'X-API-Version': '2.0' });
```

#### `customRequest<T>(config: AxiosRequestConfig): Promise<T>`

Make custom authenticated requests.

```typescript
const customData = await client.customRequest({
  method: 'GET',
  url: '/custom-endpoint'
});
```

## Error Handling

The client uses a custom `HeimdallError` class for all API errors:

```typescript
import { HeimdallError } from '@luismr/heimdall-client';

try {
  await client.login({ username: 'invalid', password: 'invalid' });
} catch (error) {
  if (error instanceof HeimdallError) {
    console.log('Status:', error.status);        // HTTP status code
    console.log('Message:', error.message);      // Error message
    console.log('Response:', error.response);    // Server response
  }
}
```

### Common Error Responses

#### 400 Bad Request
```json
{ "error": "Username and password are required" }
{ "error": "User already exists" }
```

#### 401 Unauthorized
```json
{ "error": "Invalid credentials" }
{ "error": "Invalid or expired token" }
```

#### 403 Forbidden
```json
{ "error": "Admin role required" }
```

## Advanced Usage

### Using with React

```typescript
import React, { createContext, useContext, useState } from 'react';
import { HeimdallClient, AuthContext } from '@luismr/heimdall-client';

const client = new HeimdallClient({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api'
});

const AuthContextReact = createContext<{
  client: HeimdallClient;
  authContext: AuthContext;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authContext, setAuthContext] = useState<AuthContext>(client.getAuthContext());

  const login = async (username: string, password: string) => {
    const result = await client.login({ username, password });
    setAuthContext(client.getAuthContext());
  };

  const logout = async () => {
    const context = client.getAuthContext();
    if (context.refreshToken) {
      await client.logout({ refreshToken: context.refreshToken });
    }
    setAuthContext(client.getAuthContext());
  };

  return (
    <AuthContextReact.Provider value={{ client, authContext, login, logout }}>
      {children}
    </AuthContextReact.Provider>
  );
};

export const useAuth = () => useContext(AuthContextReact);
```

### Using with Express.js

```typescript
import express from 'express';
import { HeimdallClient } from '@luismr/heimdall-client';

const app = express();
const client = new HeimdallClient({
  baseURL: 'http://heimdall-server:4000/api'
});

app.post('/api/register', async (req, res) => {
  try {
    const user = await client.signup(req.body);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof HeimdallError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
```

### Environment Configuration

Create a `.env` file:

```env
HEIMDALL_API_URL=http://localhost:4000/api
HEIMDALL_TIMEOUT=10000
```

```typescript
const client = new HeimdallClient({
  baseURL: process.env.HEIMDALL_API_URL || 'http://localhost:4000/api',
  timeout: parseInt(process.env.HEIMDALL_TIMEOUT || '10000')
});
```

## TypeScript Support

The library is written in TypeScript and includes complete type definitions:

```typescript
import {
  HeimdallClient,
  User,
  LoginResponse,
  HeimdallError,
  AuthContext,
  HeimdallClientConfig
} from '@luismr/heimdall-client';
```

## Testing

The library includes comprehensive test coverage using Jest and nock for HTTP mocking:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Documentation

- **🚀 Quick Start & Examples** - See [QUICKSTART.md](QUICKSTART.md)
- **📦 Release Information** - See [RELEASE.md](RELEASE.md)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Security

If you discover a security vulnerability, please send an e-mail to the repository owner. All security vulnerabilities will be promptly addressed.

---

**Made with ❤️ for seamless Heimdall API integration** 