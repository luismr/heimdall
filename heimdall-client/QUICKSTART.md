# Quick Start Guide - Heimdall Client

This guide will help you get started with the `@luismr/heimdall-client` package quickly and easily.

## 🚀 Installation & Setup

### Step 1: Configure GitHub Packages

Create a `.npmrc` file in your project root:

```npmrc
@luismr:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Replace `YOUR_GITHUB_TOKEN` with a GitHub Personal Access Token that has `read:packages` permission.

### Step 2: Install the Package

```bash
npm install @luismr/heimdall-client
```

## 🏗️ Project Setup from Scratch

### Create a New Node.js Project

```bash
# Create new project directory
mkdir my-heimdall-app
cd my-heimdall-app

# Initialize npm project
npm init -y

# Install dependencies
npm install typescript @types/node ts-node nodemon

# Create TypeScript config
npx tsc --init
```

### Configure GitHub Packages

Create `.npmrc` file in your project root:

```npmrc
@luismr:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Install the Heimdall client:

```bash
npm install @luismr/heimdall-client
```

## 📝 Complete Working Example

Create `src/app.ts`:

```typescript
import { HeimdallClient, HeimdallError } from '@luismr/heimdall-client';

// Initialize the client
const client = new HeimdallClient({
  baseURL: 'http://localhost:4000/api', // Your Heimdall server URL
  timeout: 10000,
  headers: {
    'X-Client-App': 'my-heimdall-app'
  }
});

async function demonstrateAuth() {
  try {
    console.log('🔥 Heimdall Client Demo');
    console.log('=====================');

    // 1. Register a new user
    console.log('\n1. Registering new user...');
    const user = await client.signup({
      username: 'demo-user',
      password: 'securepassword123'
    });
    console.log('✅ User registered:', user);

    // 2. Login with the new user
    console.log('\n2. Logging in...');
    const loginResult = await client.login({
      username: 'demo-user',
      password: 'securepassword123'
    });
    console.log('✅ Login successful');
    console.log('🔑 Access Token:', loginResult.accessToken.substring(0, 20) + '...');
    console.log('🔄 Refresh Token:', loginResult.refreshToken.substring(0, 20) + '...');
    console.log('👤 User:', loginResult.user);

    // 3. Check authentication status
    console.log('\n3. Authentication status...');
    console.log('🔐 Is Authenticated:', client.isAuthenticated());
    
    const authContext = client.getAuthContext();
    console.log('📋 Current User:', authContext.user?.username);
    console.log('🏷️ User Roles:', authContext.user?.roles);

    // 4. Demonstrate automatic token management
    console.log('\n4. Making authenticated requests...');
    // All subsequent requests will automatically include the authorization header
    
    // 5. Logout
    console.log('\n5. Logging out...');
    await client.logout({
      refreshToken: loginResult.refreshToken
    });
    console.log('✅ Logout successful');
    console.log('🔓 Is Authenticated:', client.isAuthenticated());

  } catch (error) {
    if (error instanceof HeimdallError) {
      console.error('❌ Heimdall Error:', error.message);
      console.error('📊 Status:', error.status);
      console.error('📝 Response:', error.response);
    } else {
      console.error('❌ Unexpected Error:', error);
    }
  }
}

async function demonstrateAdmin() {
  try {
    console.log('\n🛡️ Admin Operations Demo');
    console.log('========================');

    // Login as admin (assuming admin user exists)
    console.log('\n1. Logging in as admin...');
    const adminLogin = await client.login({
      username: 'admin',
      password: 'adminpassword'
    });
    console.log('✅ Admin login successful');

    // Block a user
    console.log('\n2. Blocking a user...');
    await client.blockUser({ username: 'demo-user' });
    console.log('✅ User blocked successfully');

    // Unblock a user
    console.log('\n3. Unblocking a user...');
    await client.unblockUser({ username: 'demo-user' });
    console.log('✅ User unblocked successfully');

    // Note: Be careful with removeUser in demo!
    console.log('\n4. User removal available but skipped in demo');

  } catch (error) {
    if (error instanceof HeimdallError) {
      console.error('❌ Admin Operation Failed:', error.message);
      if (error.status === 403) {
        console.error('🚫 Insufficient permissions - admin role required');
      }
    } else {
      console.error('❌ Unexpected Error:', error);
    }
  }
}

async function demonstrateErrorHandling() {
  console.log('\n⚠️ Error Handling Demo');
  console.log('======================');

  try {
    // Attempt login with invalid credentials
    await client.login({
      username: 'invalid-user',
      password: 'wrong-password'
    });
  } catch (error) {
    if (error instanceof HeimdallError) {
      console.log('✅ Caught HeimdallError as expected');
      console.log('📊 Status Code:', error.status); // 401
      console.log('📝 Error Message:', error.message); // "Invalid credentials"
      console.log('🔍 Server Response:', error.response);
    }
  }

  try {
    // Attempt admin operation without authentication
    client.clearAuthContext();
    await client.blockUser({ username: 'someone' });
  } catch (error) {
    if (error instanceof HeimdallError) {
      console.log('✅ Caught authorization error as expected');
      console.log('📊 Status Code:', error.status); // 401 or 403
      console.log('📝 Error Message:', error.message);
    }
  }
}

// Run the demo
async function main() {
  await demonstrateAuth();
  await demonstrateAdmin();
  await demonstrateErrorHandling();
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { client };
```

### Using with Environment Variables

Create `.env` file:

```env
HEIMDALL_API_URL=http://localhost:4000/api
HEIMDALL_TIMEOUT=10000
HEIMDALL_CLIENT_ID=my-app
```

Update your TypeScript code:

```typescript
import dotenv from 'dotenv';
dotenv.config();

const client = new HeimdallClient({
  baseURL: process.env.HEIMDALL_API_URL || 'http://localhost:4000/api',
  timeout: parseInt(process.env.HEIMDALL_TIMEOUT || '10000'),
  headers: {
    'X-Client-ID': process.env.HEIMDALL_CLIENT_ID || 'unknown'
  }
});
```

## 📦 Package.json Configuration

Update your `package.json`:

```json
{
  "name": "my-heimdall-app",
  "version": "1.0.0",
  "main": "dist/app.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js",
    "dev": "nodemon --exec ts-node src/app.ts",
    "demo": "ts-node src/app.ts"
  },
  "dependencies": {
    "@luismr/heimdall-client": "^0.0.1",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "@types/node": "^20.12.12",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1",
    "typescript": "^5.4.5"
  }
}
```

## 🚀 Running the Application

```bash
# Development mode
npm run dev

# Or run the demo directly
npm run demo

# Build and run production
npm run build
npm start
```

## 🌐 Framework Integration Examples

### React Integration

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { HeimdallClient, AuthContext, HeimdallError } from '@luismr/heimdall-client';

const client = new HeimdallClient({
  baseURL: process.env.REACT_APP_HEIMDALL_API_URL || 'http://localhost:4000/api'
});

export const useAuth = () => {
  const [authContext, setAuthContext] = useState<AuthContext>(client.getAuthContext());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await client.login({ username, password });
      setAuthContext(client.getAuthContext());
    } catch (err) {
      if (err instanceof HeimdallError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const context = client.getAuthContext();
      if (context.refreshToken) {
        await client.logout({ refreshToken: context.refreshToken });
      }
      setAuthContext(client.getAuthContext());
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await client.signup({ username, password });
      return user;
    } catch (err) {
      if (err instanceof HeimdallError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    client,
    authContext,
    isAuthenticated: client.isAuthenticated(),
    loading,
    error,
    login,
    logout,
    signup,
  };
};
```

```tsx
// components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      console.log('Login successful!');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### Express.js Middleware Integration

```typescript
// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { HeimdallClient, HeimdallError } from '@luismr/heimdall-client';

const client = new HeimdallClient({
  baseURL: process.env.HEIMDALL_API_URL || 'http://localhost:4000/api'
});

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.substring(7);
    
    // Set token in client context for subsequent requests
    client.setAuthContext({ accessToken: token });
    
    // Make a test request to validate the token
    // You might want to implement a token validation endpoint
    const context = client.getAuthContext();
    req.user = context.user;
    
    next();
  } catch (error) {
    if (error instanceof HeimdallError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Usage in Express app
// app.use('/protected', authMiddleware);
```

### Vue.js Composition API

```typescript
// composables/useAuth.ts
import { ref, reactive } from 'vue';
import { HeimdallClient, AuthContext, HeimdallError } from '@luismr/heimdall-client';

const client = new HeimdallClient({
  baseURL: process.env.VUE_APP_HEIMDALL_API_URL || 'http://localhost:4000/api'
});

const authContext = reactive<AuthContext>(client.getAuthContext());
const loading = ref(false);
const error = ref<string | null>(null);

export const useAuth = () => {
  const login = async (username: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await client.login({ username, password });
      Object.assign(authContext, client.getAuthContext());
      return result;
    } catch (err) {
      if (err instanceof HeimdallError) {
        error.value = err.message;
      } else {
        error.value = 'An unexpected error occurred';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    try {
      if (authContext.refreshToken) {
        await client.logout({ refreshToken: authContext.refreshToken });
      }
      Object.assign(authContext, client.getAuthContext());
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      loading.value = false;
    }
  };

  return {
    client,
    authContext,
    isAuthenticated: client.isAuthenticated(),
    loading,
    error,
    login,
    logout,
  };
};
```

## 🔧 Advanced Configuration

### Custom Axios Configuration

```typescript
import { HeimdallClient } from '@luismr/heimdall-client';

const client = new HeimdallClient({
  baseURL: 'https://api.example.com/api',
  timeout: 15000,
  headers: {
    'X-API-Version': '1.0',
    'X-Client-Platform': 'web',
    'X-Client-Version': '1.0.0'
  }
});

// Update configuration after creation
client.updateBaseURL('https://new-api.example.com/api');
client.updateHeaders({
  'X-Environment': process.env.NODE_ENV || 'development'
});
```

### Custom Request Interceptors

While the client handles authentication automatically, you can make custom requests:

```typescript
// Custom authenticated request
const customData = await client.customRequest({
  method: 'GET',
  url: '/custom-endpoint',
  params: { page: 1, limit: 10 },
  headers: { 'X-Custom-Header': 'value' }
});

// Custom request with error handling
try {
  const result = await client.customRequest({
    method: 'POST',
    url: '/custom-action',
    data: { action: 'custom-operation' }
  });
  console.log('Custom operation result:', result);
} catch (error) {
  if (error instanceof HeimdallError) {
    console.error('Custom operation failed:', error.message);
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Package Not Found
```bash
# Error: Package '@luismr/heimdall-client' not found
# Solution: Ensure .npmrc is configured correctly
cat .npmrc
# Should contain:
# @luismr:registry=https://npm.pkg.github.com
# //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

#### 2. Unauthorized Access
```typescript
// Error: 401 Unauthorized when calling APIs
// Solution: Check if server is running and accessible
const client = new HeimdallClient({
  baseURL: 'http://localhost:4000/api' // Ensure this matches your server
});

// Test connection
try {
  await client.signup({ username: 'test', password: 'test' });
} catch (error) {
  console.error('Connection test failed:', error.message);
}
```

#### 3. TypeScript Errors
```bash
# Error: Cannot find module '@luismr/heimdall-client'
# Solution: Ensure TypeScript can find the types
npm install --save-dev @types/node

# If still having issues, try:
npm install @luismr/heimdall-client --force
```

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
// Add custom headers for debugging
const client = new HeimdallClient({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'X-Debug': 'true',
    'X-Client-Version': '1.0.0'
  }
});

// Log all requests/responses in development
if (process.env.NODE_ENV === 'development') {
  // You can extend the client to add logging interceptors
}
```

---

**🎉 Congratulations!** You now have a fully functional Heimdall client setup. Check the [README.md](README.md) for complete API documentation and advanced usage examples. 