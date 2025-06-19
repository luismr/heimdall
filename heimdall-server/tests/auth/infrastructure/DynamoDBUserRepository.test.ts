import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { User } from '../../../src/auth/domain/User';
import { DynamoDBUserRepository } from '../../../src/auth/infrastructure/DynamoDBUserRepository';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('DynamoDBUserRepository', () => {
  let userRepository: DynamoDBUserRepository;

  beforeEach(() => {
    ddbMock.reset();
    userRepository = new DynamoDBUserRepository();
    process.env.USERS_TABLE = 'test-users';
  });

  describe('findByUsername', () => {
    it('should return a user when found', async () => {
      const userData = {
        username: 'testuser',
        passwordHash: 'hashedpassword',
        roles: ['USER'],
        blocked: false,
        refreshTokens: []
      };
      ddbMock.on(GetCommand).resolves({ Item: userData });
      const user = await userRepository.findByUsername('testuser');
      expect(user).toBeInstanceOf(User);
      expect(user?.username).toBe('testuser');
    });

    it('should return null when user not found', async () => {
      ddbMock.on(GetCommand).resolves({ Item: undefined });
      const user = await userRepository.findByUsername('nonexistent');
      expect(user).toBeNull();
    });
  });

  describe('findByRefreshToken', () => {
    it('should return a user when token is found', async () => {
      const userData = {
        username: 'testuser',
        passwordHash: 'hashedpassword',
        roles: ['USER'],
        blocked: false,
        refreshTokens: ['valid-token']
      };
      ddbMock.on(ScanCommand).resolves({ Items: [userData] });
      const user = await userRepository.findByRefreshToken('valid-token');
      expect(user).toBeInstanceOf(User);
    });

    it('should return null when token is not found', async () => {
      ddbMock.on(ScanCommand).resolves({ Items: [] });
      const user = await userRepository.findByRefreshToken('invalid-token');
      expect(user).toBeNull();
    });
  });

  describe('save', () => {
    it('should save a user', async () => {
      ddbMock.on(PutCommand).resolves({});
      const user = new User('newuser', 'password', ['USER'], false, []);
      await userRepository.save(user);
      expect(ddbMock.commandCalls(PutCommand).length).toBe(1);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      ddbMock.on(DeleteCommand).resolves({});
      await userRepository.remove('testuser');
      expect(ddbMock.commandCalls(DeleteCommand).length).toBe(1);
    });
  });
}); 