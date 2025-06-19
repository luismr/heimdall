import { UserRepository } from './UserRepository';
import { DynamoDBUserRepository } from './DynamoDBUserRepository';
import { PostgresUserRepository } from './PostgresUserRepository';

export class UserRepositoryFactory {
  static create(): UserRepository {
    const dbType = process.env.DB_TYPE || 'dynamodb';
    
    switch (dbType.toLowerCase()) {
      case 'postgres':
        return new PostgresUserRepository();
      case 'dynamodb':
        return new DynamoDBUserRepository();
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
} 