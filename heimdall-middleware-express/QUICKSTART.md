# Quick Start Guide - Heimdall Middleware Express

This guide will help you get started with the `@luismr/heimdall-middleware-express` package quickly and easily.

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
npm install @luismr/heimdall-middleware-express
```

## 🏗️ Project Setup from Scratch

### Create a New Express Project

```bash
# Create new project directory
mkdir my-express-app
cd my-express-app

# Initialize npm project
npm init -y

# Install dependencies
npm install express
npm install -D typescript @types/express @types/node ts-node nodemon

# Create TypeScript config
npx tsc --init
```

### Configure GitHub Packages

Create `.npmrc` file in your project root:

```npmrc
@luismr:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Install the heimdall middleware:

```bash
npm install @luismr/heimdall-middleware-express
```

## 📝 Complete Working Example

Create `src/app.ts`:

```typescript
import express from 'express';
import { 
  requireAuth, 
  requireAdmin, 
  isRole, 
  AuthRequest 
} from '@luismr/heimdall-middleware-express';

const app = express();

// Middleware
app.use(express.json());

// Public routes (no authentication required)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

app.post('/login', (req, res) => {
  // In a real app, validate credentials here
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'password') {
    // Create JWT token (you'll need to implement this)
    const token = 'your-jwt-token-here';
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Protected routes (authentication required)
app.get('/profile', requireAuth, (req: AuthRequest, res) => {
  res.json({ 
    message: 'Profile data', 
    user: req.user 
  });
});

app.get('/dashboard', requireAuth, (req: AuthRequest, res) => {
  const isAdminOrModerator = isRole(req, 'ROLE_ADMIN', 'ROLE_MODERATOR');
  
  res.json({
    message: 'Dashboard data',
    user: req.user,
    adminAccess: isAdminOrModerator
  });
});

// Admin-only routes
app.get('/admin/users', requireAdmin, (req: AuthRequest, res) => {
  res.json({ 
    message: 'Admin: List of all users',
    users: [
      { id: 1, username: 'user1' },
      { id: 2, username: 'user2' }
    ]
  });
});

app.delete('/admin/users/:id', requireAdmin, (req: AuthRequest, res) => {
  const userId = req.params.id;
  res.json({ 
    message: `Admin: Deleted user ${userId}`,
    deletedBy: req.user 
  });
});

// Custom role-based route
app.get('/moderator/posts', requireAuth, (req: AuthRequest, res) => {
  if (!isRole(req, 'ROLE_ADMIN', 'ROLE_MODERATOR')) {
    return res.status(403).json({ error: 'Moderator role required' });
  }
  
  res.json({ 
    message: 'Moderator: Posts management',
    user: req.user 
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the API at http://localhost:${PORT}`);
});

export default app;
```

## 📦 Package.json Configuration

Update your `package.json`:

```json
{
  "name": "my-express-app",
  "version": "1.0.0",
  "main": "dist/app.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js",
    "dev": "nodemon --exec ts-node src/app.ts",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.19.2",
    "@luismr/heimdall-middleware-express": "^0.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.12.12",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1",
    "typescript": "^5.4.5"
  }
}
```

## 🔐 Environment Configuration

Create `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
```

## 🚀 Running the Application

```bash
# Development mode
npm run dev

# Production build and run
npm run build
npm start
```

## 🧪 Testing the API

### Using cURL

```bash
# Public route (should work)
curl http://localhost:3000/

# Protected route without token (should fail with 401)
curl http://localhost:3000/profile

# Protected route with token (should work)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/profile

# Admin route with admin token (should work)
curl -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" http://localhost:3000/admin/users

# Create a user (admin only)
curl -X DELETE -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" http://localhost:3000/admin/users/1
```

### Using Postman or Thunder Client

1. **GET** `http://localhost:3000/` - Public route
2. **POST** `http://localhost:3000/login` - Login endpoint
   ```json
   {
     "username": "admin",
     "password": "password"
   }
   ```
3. **GET** `http://localhost:3000/profile` - Protected route
   - Headers: `Authorization: Bearer YOUR_JWT_TOKEN`
4. **GET** `http://localhost:3000/admin/users` - Admin route
   - Headers: `Authorization: Bearer YOUR_ADMIN_JWT_TOKEN`

## 🔧 Custom Middleware Examples

### Create Custom Role Middleware

```typescript
// Custom middleware for specific roles
const requireModerator = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  requireAuth(req, res, () => {
    if (!isRole(req, 'ROLE_ADMIN', 'ROLE_MODERATOR')) {
      return res.status(403).json({ error: 'Moderator role required' });
    }
    next();
  });
};

// Use the custom middleware
app.get('/moderate/content', requireModerator, (req: AuthRequest, res) => {
  res.json({ message: 'Content moderation panel' });
});
```

### Multiple Role Requirements

```typescript
// Require specific roles
const requireManagerOrAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  requireAuth(req, res, () => {
    if (!isRole(req, 'ROLE_ADMIN', 'ROLE_MANAGER')) {
      return res.status(403).json({ error: 'Manager or Admin role required' });
    }
    next();
  });
};

app.get('/reports', requireManagerOrAdmin, (req: AuthRequest, res) => {
  res.json({ message: 'Financial reports', user: req.user });
});
```

### Conditional Access

```typescript
app.get('/dashboard', requireAuth, (req: AuthRequest, res) => {
  const userRoles = req.user?.roles || [];
  const isAdmin = isRole(req, 'ROLE_ADMIN');
  const isModerator = isRole(req, 'ROLE_MODERATOR');
  
  const response = {
    message: 'Dashboard',
    user: req.user,
    features: {
      userManagement: isAdmin,
      contentModeration: isAdmin || isModerator,
      analytics: isAdmin,
      basicFeatures: true
    }
  };
  
  res.json(response);
});
```

## 🔍 Advanced Usage Patterns

### Route Protection Patterns

```typescript
// Protect entire route groups
const adminRouter = express.Router();
adminRouter.use(requireAdmin); // All routes require admin

adminRouter.get('/users', (req: AuthRequest, res) => {
  res.json({ users: [] });
});

adminRouter.get('/settings', (req: AuthRequest, res) => {
  res.json({ settings: {} });
});

app.use('/admin', adminRouter);
```

### Middleware Chaining

```typescript
// Chain multiple middleware
app.get('/sensitive-data', 
  requireAuth,
  (req: AuthRequest, res, next) => {
    // Additional custom validation
    if (!req.user?.emailVerified) {
      return res.status(403).json({ error: 'Email verification required' });
    }
    next();
  },
  (req: AuthRequest, res) => {
    res.json({ sensitiveData: 'secret information' });
  }
);
```

### Role-Based Response Filtering

```typescript
app.get('/users', requireAuth, (req: AuthRequest, res) => {
  const isAdmin = isRole(req, 'ROLE_ADMIN');
  
  const users = [
    { id: 1, name: 'John', email: 'john@example.com', role: 'USER' },
    { id: 2, name: 'Jane', email: 'jane@example.com', role: 'ADMIN' }
  ];
  
  // Filter sensitive information based on role
  const filteredUsers = users.map(user => {
    if (isAdmin) {
      return user; // Admin sees everything
    } else {
      // Regular users see limited info
      return { id: user.id, name: user.name };
    }
  });
  
  res.json({ users: filteredUsers });
});
```

## 🛠️ JWT Token Examples

### Expected JWT Payload Structure

```json
{
  "sub": "user123",
  "email": "user@example.com",
  "username": "johndoe",
  "roles": ["ROLE_USER", "ROLE_ADMIN"],
  "iat": 1640995200,
  "exp": 1641081600,
  "emailVerified": true,
  "permissions": ["read:users", "write:posts"]
}
```

### Creating JWT Tokens (Example)

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Create token for authenticated user
function createUserToken(user: any) {
  return jwt.sign({
    sub: user.id,
    email: user.email,
    username: user.username,
    roles: user.roles,
    emailVerified: user.emailVerified
  }, JWT_SECRET, {
    expiresIn: '24h'
  });
}

// Example usage in login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Validate credentials (implement your logic)
  const user = await authenticateUser(username, password);
  
  if (user) {
    const token = createUserToken(user);
    res.json({ token, user: { id: user.id, username: user.username } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
```

## 🚨 Error Handling

### Common Response Formats

```typescript
// 401 Unauthorized
{
  "error": "Missing or invalid Authorization header"
}

// 401 Unauthorized
{
  "error": "Invalid or expired token"
}

// 403 Forbidden
{
  "error": "Admin role required"
}
```

### Custom Error Handler

```typescript
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token format' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token has expired' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});
```

## 📋 Troubleshooting

### Common Issues

#### Token Not Working
```bash
# Check token format
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/profile

# Verify token is properly formatted JWT
echo "YOUR_TOKEN" | cut -d. -f2 | base64 -d
```

#### Role Access Denied
```typescript
// Debug user roles
app.get('/debug/user', requireAuth, (req: AuthRequest, res) => {
  res.json({
    user: req.user,
    roles: req.user?.roles,
    isAdmin: isRole(req, 'ROLE_ADMIN')
  });
});
```

#### Environment Issues
```bash
# Check environment variables
echo $JWT_SECRET

# Verify .env file is loaded
npm install dotenv
```

---

**Ready to get started? 🚀**

*For detailed API reference, see [README.md](README.md)*
*For development setup, see [BUILD.md](BUILD.md)*
*For contributing, see [CONTRIBUTE.md](CONTRIBUTE.md)* 