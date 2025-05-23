# Heimdall API Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18.x-green?logo=express)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![AWS DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-orange?logo=amazon-aws)](https://aws.amazon.com/dynamodb/)
[![Jest](https://img.shields.io/badge/Jest-29.x-red?logo=jest)](https://jestjs.io/)
[![Serverless](https://img.shields.io/badge/Serverless-3.x-fd5750?logo=serverless)](https://www.serverless.com/)

A comprehensive authentication and authorization API server built with Domain-Driven Design (DDD) principles, featuring JWT-based authentication, role-based access control, and AWS DynamoDB integration. Designed for serverless deployment with comprehensive test coverage.

## Features

- 🔐 **JWT Authentication**: Secure token-based authentication with refresh tokens
- 👥 **Role-Based Access Control**: Fine-grained permission management
- 🏗️ **Domain-Driven Design**: Clean architecture with separated concerns
- 📦 **TypeScript Support**: Full TypeScript implementation with strict typing
- 🗄️ **DynamoDB Integration**: Scalable NoSQL database integration
- ☁️ **Serverless Ready**: Deploy to AWS Lambda with Serverless Framework
- 🧪 **Comprehensive Testing**: 90%+ test coverage with Jest
- 🛡️ **Security First**: bcrypt password hashing and JWT security
- 🚀 **Express.js**: RESTful API with Express.js framework

## Architecture

This project follows Domain-Driven Design (DDD) principles with clean architecture:

```
src/
├── auth/
│   ├── domain/           # Business logic and entities
│   │   ├── User.ts       # User entity with business rules
│   │   └── UserDomain.ts # Domain services
│   ├── application/      # Use cases and application services
│   │   ├── LoginUseCase.ts
│   │   ├── SignupUseCase.ts
│   │   └── ...
│   ├── infrastructure/   # External concerns (database, etc.)
│   │   └── UserRepository.ts
│   └── api/             # Controllers and routes
│       ├── AuthController.ts
│       ├── AdminController.ts
│       └── AuthRoutes.ts
├── app.ts               # Express app configuration
├── server.ts           # Development server
└── lambda.ts           # AWS Lambda handler
```

## Installation

```bash
# Clone the repository
git clone https://github.com/luismr/heimdall.git
cd heimdall/heimdall-server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

## Environment Variables

Create a `.env` file in the project root:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS DynamoDB Configuration
AWS_REGION=us-east-1
USERS_TABLE=HeimdallUsers

# Server Configuration
PORT=4000
NODE_ENV=development
```

> ⚠️ **Important**: Always use strong secrets in production environments!

## Quick Start

### Development Server

```bash
# Start development server with hot reload
npm run dev

# The API will be available at http://localhost:4000
```

### Serverless Local Development

```bash
# Start serverless offline
npm run serverless:dev

# The API will be available at http://localhost:4000
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Endpoints

### Base URL
- **Development**: `http://localhost:4000/api`
- **Production**: `https://your-api-domain.com/api`

### Authentication Endpoints

#### POST `/signup`
Register a new user account.

**Request:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "username": "johndoe",
  "roles": ["ROLE_USER"],
  "blocked": false
}
```

#### POST `/login`
Authenticate user and get JWT tokens.

**Request:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "username": "johndoe",
    "roles": ["ROLE_USER"],
    "blocked": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/logout` 🔒
Logout user and invalidate refresh token.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Admin Endpoints

All admin endpoints require `ROLE_ADMIN` role.

#### POST `/admin/block` 🔒👑
Block a user account.

**Headers:**
```
Authorization: Bearer <admin-access-token>
```

**Request:**
```json
{
  "username": "usertoblock"
}
```

**Response:**
```json
{
  "message": "User blocked"
}
```

#### POST `/admin/unblock` 🔒👑
Unblock a user account.

**Headers:**
```
Authorization: Bearer <admin-access-token>
```

**Request:**
```json
{
  "username": "usertounblock"
}
```

**Response:**
```json
{
  "message": "User unblocked"
}
```

#### POST `/admin/remove` 🔒👑
Remove a user account permanently.

**Headers:**
```
Authorization: Bearer <admin-access-token>
```

**Request:**
```json
{
  "username": "usertoremove"
}
```

**Response:**
```json
{
  "message": "User removed"
}
```

## Error Responses

The API returns standard HTTP error responses:

### 400 Bad Request
```json
{ "error": "Username and password are required" }
{ "error": "User already exists" }
```

### 401 Unauthorized
```json
{ "error": "Invalid credentials" }
{ "error": "Missing or invalid Authorization header" }
```

### 403 Forbidden
```json
{ "error": "Admin role required" }
```

### 500 Internal Server Error
```json
{ "error": "Internal server error" }
```

## Deployment

### AWS Lambda with Serverless Framework

```bash
# Deploy to development
npm run serverless:deploy

# Deploy to production
npm run serverless:deploy -- --stage prod
```

### Traditional Server Deployment

```bash
# Build the project
npm run build

# Start production server
npm start
```

## Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Domain logic and use cases
- **Integration Tests**: API endpoints and database operations
- **Coverage**: 90%+ test coverage across all layers

### Test Structure

```
tests/
├── auth/
│   ├── domain/           # Domain layer tests
│   ├── application/      # Application layer tests
│   ├── infrastructure/   # Infrastructure layer tests
│   └── api/             # API layer tests
└── setup.ts             # Test configuration
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- tests/auth/domain/

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## Dependencies

### Core Dependencies
- **Express.js**: Web framework
- **@luismr/heimdall-middleware-express**: Authentication middleware
- **@aws-sdk/client-dynamodb**: AWS DynamoDB client
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token management
- **serverless-http**: Serverless Express adapter

### Development Dependencies
- **TypeScript**: Type-safe development
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Serverless Framework**: Deployment framework

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain test coverage above 90%
- Follow DDD principles and clean architecture
- Use conventional commit messages
- Update documentation for new features

## Security

- Passwords are hashed using bcrypt with salt rounds
- JWT tokens are signed with HMAC SHA256
- Refresh tokens are stored securely and can be invalidated
- Role-based access control for sensitive operations
- Input validation and sanitization

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Related Projects

- **[@luismr/heimdall-middleware-express](https://github.com/luismr/heimdall/tree/main/heimdall-middleware-express)**: Authentication middleware for Express.js

---

**Made with ❤️ for secure API development** 