# Heimdall - Guardian of Your API Realms

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18.x-green?logo=express)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![AWS DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-orange?logo=amazon-aws)](https://aws.amazon.com/dynamodb/)
[![Jest](https://img.shields.io/badge/Jest-29.x-red?logo=jest)](https://jestjs.io/)

> *"I am Heimdall, guardian of the Bifröst, protector of the realms."*

A comprehensive authentication and authorization ecosystem for Node.js applications, inspired by the Norse god Heimdall - the all-seeing guardian who protects the rainbow bridge connecting different realms.

## 🌈 Why Heimdall?

Heimdall is a powerful Asgardian warrior who serves as the guardian of the Bifröst, the rainbow bridge that connects Asgard to the other realms. Just as Heimdall watches over all who pass through the bridge with his all-seeing eyes, our Heimdall ecosystem guards your APIs and applications, ensuring only authorized users can access your digital realms.

### The Guardian's Powers:
- 👁️ **All-Seeing**: Monitors all authentication attempts across your application
- 🛡️ **Guardian**: Protects your API endpoints with robust security
- 🌉 **Bridge Builder**: Seamlessly connects different parts of your application
- ⚡ **Swift Response**: Lightning-fast authentication and authorization
- 🔐 **Keeper of Keys**: Manages JWT tokens and user sessions securely

## 🏗️ Architecture Overview

The Heimdall ecosystem consists of three main components that work together to provide complete authentication and authorization:

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              Heimdall Ecosystem                                      │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────┐    ┌───────────────────────────┐    ┌───────────────────┐   │
│  │  Heimdall Server    │◄──►│ Heimdall Middleware       │◄──►│ Heimdall Client   │   │
│  │  (API Backend)      │    │ (Express.js Library)      │    │ (TypeScript SDK)  │   │
│  │                     │    │                           │    │                   │   │
│  │ • User Management   │    │ • JWT Validation          │    │ • API Client      │   │
│  │ • Authentication    │    │ • Role-Based Access       │    │ • Token Mgmt      │   │
│  │ • Token Generation  │    │ • Request Protection      │    │ • Type Safety     │   │
│  │ • Admin Operations  │    │ • Easy Integration        │    │ • Error Handling  │   │
│  │ • DDD Architecture  │    │ • TypeScript Support      │    │ • Framework Agno. │   │
│  │ • DynamoDB Storage  │    │                           │    │ • Axios Based     │   │
│  └─────────────────────┘    └───────────────────────────┘    └───────────────────┘   │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## 📦 Components

### 🖥️ [Heimdall Server](./heimdall-server/)
[![npm version](https://badge.fury.io/js/%40luismr%2Fheimdall-api.svg)](https://badge.fury.io/js/%40luismr%2Fheimdall-api)

The central authentication server built with Domain-Driven Design principles.

**Features:**
- 🔐 Complete authentication API (signup, login, logout)
- 👥 User management with role-based access control
- 🏗️ Clean DDD architecture with separated concerns
- 🗄️ AWS DynamoDB integration for scalable storage
- ☁️ Serverless-ready deployment with AWS Lambda
- 🧪 90%+ test coverage with comprehensive testing
- 🛡️ Secure password hashing with bcrypt
- 🎫 JWT token management with refresh tokens

```bash
cd heimdall-server
npm install
npm run dev
```

### 🛡️ [Heimdall Middleware Express](./heimdall-middleware-express/)
[![npm version](https://badge.fury.io/js/%40luismr%2Fheimdall-middleware-express.svg)](https://badge.fury.io/js/%40luismr%2Fheimdall-middleware-express)

Lightweight Express.js middleware for protecting your API endpoints.

**Features:**
- ⚡ Easy Express.js integration
- 🔍 JWT token validation
- 👮 Role-based route protection
- 📦 TypeScript definitions included
- 🚀 Zero configuration setup
- 🔧 Utility functions for flexible access control

```bash
npm install @luismr/heimdall-middleware-express
```

### 🔧 [Heimdall Client](./heimdall-client/)
[![npm version](https://badge.fury.io/js/%40luismr%2Fheimdall-client.svg)](https://badge.fury.io/js/%40luismr%2Fheimdall-client)

TypeScript client library for consuming Heimdall authentication API endpoints.

**Features:**
- 🎯 Type-safe API client with full TypeScript support
- 🔄 Automatic authentication context management
- ⚡ Built on Axios with request/response interceptors
- 🛡️ Comprehensive error handling with custom error types
- 🔐 JWT token management and auto-renewal
- 🏗️ Framework-agnostic (React, Vue, Node.js, etc.)
- 🧪 100% test coverage with comprehensive testing
- 📚 Rich examples and documentation

```bash
npm install @luismr/heimdall-client
```

## 🚀 Quick Start

### 1. Set Up the Authentication Server

```bash
# Clone and setup the server
git clone https://github.com/luismr/heimdall.git
cd heimdall/heimdall-server
npm install
npm run dev
```

### 2. Install and Use the Client

```bash
# In your application project
npm install @luismr/heimdall-client
```

```typescript
import { HeimdallClient } from '@luismr/heimdall-client';

const client = new HeimdallClient({
  baseURL: 'http://localhost:4000/api'
});

// Register a user
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
```

### 3. Protect Your API Routes

```bash
# In your Express.js API project
npm install @luismr/heimdall-middleware-express
```

```typescript
import express from 'express';
import { requireAuth, requireAdmin, AuthRequest } from '@luismr/heimdall-middleware-express';

const app = express();

// Protected route
app.get('/profile', requireAuth, (req: AuthRequest, res) => {
  res.json({ message: 'Welcome to your profile!', user: req.user });
});

// Admin-only route
app.get('/admin/dashboard', requireAdmin, (req: AuthRequest, res) => {
  res.json({ message: 'Admin dashboard access granted!' });
});

app.listen(3000);
```

### 4. Complete Integration Example

```typescript
import { HeimdallClient } from '@luismr/heimdall-client';

const client = new HeimdallClient({
  baseURL: 'http://localhost:4000/api'
});

// Register, login, and make authenticated requests
try {
  // Register a user
  await client.signup({
    username: 'johndoe',
    password: 'securepassword123'
  });

  // Login (automatically sets auth context)
  const loginResult = await client.login({
    username: 'johndoe',
    password: 'securepassword123'
  });

  // Now make requests to your protected API
  const response = await fetch('http://localhost:3000/profile', {
    headers: {
      'Authorization': `Bearer ${loginResult.accessToken}`
    }
  });

  const profile = await response.json();
  console.log(profile);

  // Logout when done
  await client.logout({
    refreshToken: loginResult.refreshToken
  });
} catch (error) {
  console.error('Authentication error:', error);
}
```

## 🌟 Use Cases

### Enterprise Applications
- **Multi-service Authentication**: Central auth server with distributed middleware
- **Microservices Security**: Each service protected with Heimdall middleware
- **Admin Dashboards**: Role-based access for administrative functions
- **Client Applications**: Type-safe authentication with Heimdall client

### SaaS Platforms
- **User Management**: Complete user lifecycle with roles and permissions
- **API Protection**: Secure your REST APIs with minimal configuration
- **Scalable Architecture**: DynamoDB backend scales with your needs
- **Frontend Integration**: Seamless authentication for web and mobile apps

### Startup MVPs
- **Rapid Development**: Get authentication working in minutes
- **Security Best Practices**: Production-ready security out of the box
- **Cost Effective**: Serverless deployment reduces infrastructure costs
- **Developer Experience**: Type-safe client with excellent DX

## 🔧 Configuration

### Environment Variables

**Heimdall Server (.env):**
```env
# Application Configuration
JWT_SECRET=your-super-secret-jwt-key
USERS_TABLE=HeimdallUsers
PORT=4000
NODE_ENV=development

# AWS Credentials (required for DynamoDB)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
```

**Your Application (.env):**
```env
JWT_SECRET=your-super-secret-jwt-key  # Must match server
HEIMDALL_API_URL=http://localhost:4000/api
```

> 📚 **AWS Configuration**: For detailed AWS credentials setup, see [AWS Environment Variables Documentation](https://docs.aws.amazon.com/sdkref/latest/guide/environment-variables.html)

## 📚 Documentation

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **🖥️ Server** | Authentication API Backend | [Server README](./heimdall-server/README.md) |
| **🛡️ Middleware** | Express.js Protection Library | [Middleware README](./heimdall-middleware-express/README.md) |
| **🔧 Client** | TypeScript API Client Library | [Client README](./heimdall-client/README.md) |
| **🚀 Quick Start** | Step-by-step Integration Guide | [Quick Start Guide](./heimdall-middleware-express/QUICKSTART.md) |
| **🔧 Development** | Build and Development Setup | [Build Guide](./heimdall-middleware-express/BUILD.md) |
| **🤝 Contributing** | Contribution Guidelines | [Contributing Guide](./heimdall-middleware-express/CONTRIBUTE.md) |

## 🧪 Testing

All components include comprehensive test suites:

```bash
# Test the server
cd heimdall-server
npm run test:coverage

# Test the middleware
cd heimdall-middleware-express
npm run test:coverage

# Test the client
cd heimdall-client
npm run test:coverage
```

**Combined Coverage:**
- **Server**: 90%+ coverage across all DDD layers
- **Middleware**: 100% coverage for authentication logic
- **Client**: 100% coverage for API client functionality
- **Integration**: Full end-to-end authentication flow testing

## 🚀 Deployment

### Production Deployment

**Server Deployment (AWS Lambda):**
```bash
cd heimdall-server
npm run serverless:deploy -- --stage prod
```

**Middleware Distribution (NPM):**
```bash
cd heimdall-middleware-express
npm publish
```

**Client Distribution (NPM):**
```bash
cd heimdall-client
npm run build
npm publish
```

### Docker Deployment (Alternative)

```dockerfile
# Dockerfile for heimdall-server
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4000
CMD ["npm", "start"]
```

## 🔒 Security Features

- **🔐 JWT Authentication**: Industry-standard token-based authentication
- **🧂 Password Hashing**: bcrypt with salt for secure password storage
- **🎫 Refresh Tokens**: Secure token rotation and session management
- **👮 Role-Based Access**: Fine-grained permission control
- **🛡️ CORS Protection**: Cross-origin request security
- **🚫 Brute Force Protection**: Rate limiting and security monitoring
- **📝 Audit Logging**: Track authentication and authorization events
- **🔒 Type Safety**: Client-side type safety prevents common security issues

## 🤝 Contributing

We welcome contributions to the Heimdall ecosystem! Please see our contributing guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Standards
- TypeScript for type safety
- Jest for comprehensive testing
- ESLint for code quality
- Conventional commits for clear history
- Documentation for all features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- **Norse Mythology**: For the inspiration behind Heimdall, the guardian of realms
- **Open Source Community**: For the amazing tools and libraries that make this possible
- **Contributors**: Everyone who helps make Heimdall more secure and reliable

---

## 🌈 The Bifröst Bridge to Secure APIs

Just as Heimdall's watchful eyes protect all Nine Realms, let our Heimdall ecosystem be the guardian of your digital domains. Build secure, scalable, and maintainable authentication systems with the power of the gods.

**Ready to guard your API realms? Choose your path:**

🖥️ **[Start with the Server](./heimdall-server/)** - Set up the authentication backend
🔧 **[Consume with Client](./heimdall-client/)** - Connect your applications securely
🛡️ **[Protect with Middleware](./heimdall-middleware-express/)** - Secure your Express.js routes
🚀 **[Quick Integration](./heimdall-middleware-express/QUICKSTART.md)** - Get started in minutes

---

***"Until the end of days, I will watch over your APIs."*** - Heimdall Guardian 