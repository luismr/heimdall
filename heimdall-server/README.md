# Heimdall API Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18.x-green?logo=express)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![AWS DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-orange?logo=amazon-aws)](https://aws.amazon.com/dynamodb/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.x-blue?logo=postgresql)](https://www.postgresql.org/)
[![Jest](https://img.shields.io/badge/Jest-29.x-red?logo=jest)](https://jestjs.io/)
[![Serverless](https://img.shields.io/badge/Serverless-3.x-fd5750?logo=serverless)](https://www.serverless.com/)

A comprehensive authentication and authorization API server built with Domain-Driven Design (DDD) principles, featuring JWT-based authentication, role-based access control, and flexible database support (AWS DynamoDB or PostgreSQL). Designed for serverless deployment with comprehensive test coverage.

## Features

- 🔐 **JWT Authentication**: Secure token-based authentication with refresh tokens
- 👥 **Role-Based Access Control**: Fine-grained permission management
- 🏗️ **Domain-Driven Design**: Clean architecture with separated concerns
- 📦 **TypeScript Support**: Full TypeScript implementation with strict typing
- 🗄️ **Flexible Database**: Choose between DynamoDB or PostgreSQL
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
│   │   ├── UserRepository.ts           # Repository interface
│   │   ├── DynamoDBUserRepository.ts   # DynamoDB implementation
│   │   ├── PostgresUserRepository.ts   # PostgreSQL implementation
│   │   └── UserRepositoryFactory.ts    # Factory for database selection
│   └── api/             # Controllers and routes
│       ├── AuthController.ts
│       ├── AdminController.ts
│       └── AuthRoutes.ts
├── commons/
│   └── infrastructure/   # Shared infrastructure components
│       └── Datasource.ts # Database configuration and connection
├── app.ts              # Express app configuration
├── server.ts           # Development server
└── lambda.ts           # AWS Lambda handler
```

The architecture follows these key principles:
- **Domain Layer**: Contains business logic and rules
- **Application Layer**: Orchestrates use cases using domain services
- **Infrastructure Layer**: Implements technical concerns like database access
- **API Layer**: Handles HTTP requests and responses
- **Repository Pattern**: Abstracts database operations with support for both DynamoDB and PostgreSQL
- **Factory Pattern**: Dynamically selects the appropriate database implementation

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
# Application Configuration
JWT_SECRET=your-super-secret-jwt-key
USERS_TABLE=HeimdallUsers
PORT=4000
NODE_ENV=development

# Database Selection
DB_TYPE=dynamodb  # Options: 'dynamodb' or 'postgres'

# AWS Credentials (required for DynamoDB)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1

# PostgreSQL Configuration (required if DB_TYPE=postgres)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=heimdall
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=heimdall
POSTGRES_SSL=false
```

> ⚠️ **Important**: Always use strong secrets in production environments!

> 📚 **Database Configuration**: Set `DB_TYPE` to either 'dynamodb' or 'postgres' to choose your database backend. Make sure to configure the corresponding environment variables for your chosen database type.

## Database Configuration

### Database Selection

The system uses the `DB_TYPE` environment variable to determine which database to use:
- Set `DB_TYPE=dynamodb` for AWS DynamoDB
- Set `DB_TYPE=postgres` for PostgreSQL

Make sure to configure the corresponding environment variables for your chosen database:
- For DynamoDB: Configure AWS credentials and `USERS_TABLE`
- For PostgreSQL: Configure all `POSTGRES_*` variables

### DynamoDB Setup

If using DynamoDB, ensure your AWS credentials are properly configured and the `USERS_TABLE` exists in your DynamoDB instance.

```bash
# Create DynamoDB table using AWS CLI
aws dynamodb create-table \
  --table-name HeimdallUsers \
  --attribute-definitions AttributeName=username,AttributeType=S \
  --key-schema AttributeName=username,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### PostgreSQL Setup

If using PostgreSQL, follow these steps:

1. Install PostgreSQL 17.x (recommended) or later
2. Create a database and user:

```sql
CREATE DATABASE heimdall;
CREATE USER heimdall WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE heimdall TO heimdall;
```

3. Run database migrations:

```bash
# Run all pending migrations
npm run typeorm:migration:run

# Revert the last applied migration
npm run typeorm:migration:revert

# Create a new empty migration (for development)
npm run typeorm:migration:create -- -n YourMigrationName

# Generate a migration from entity changes (for development)
npm run typeorm:migration:generate -- -n YourMigrationName
```

The migrations will:
- Create the users table with all necessary columns
- Set up indexes for optimal query performance
- Configure foreign key constraints if needed
- Handle any future schema changes

The system will automatically detect which database to use based on your environment configuration:
- If `POSTGRES_HOST` is set, PostgreSQL will be used
- Otherwise, DynamoDB will be used

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