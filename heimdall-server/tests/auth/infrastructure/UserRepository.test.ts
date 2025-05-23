// Mock AWS SDK before importing anything else
const mockSend = jest.fn();

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: () => ({
      send: mockSend,
    }),
  },
  GetCommand: class {
    constructor(public input: any) {}
  },
  ScanCommand: class {
    constructor(public input: any) {}
  },
  PutCommand: class {
    constructor(public input: any) {}
  },
  DeleteCommand: class {
    constructor(public input: any) {}
  },
}));

import { UserRepository } from '../../../src/auth/infrastructure/UserRepository';
import { User } from '../../../src/auth/domain/User';

const USERS_TABLE = 'TestHeimdallUsers';
process.env.USERS_TABLE = USERS_TABLE;

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });

  describe('findByUsername', () => {
    it('should return user when found', async () => {
      const username = 'testuser';
      const userData = {
        username,
        passwordHash: 'hashedPassword',
        roles: ['ROLE_USER'],
        blocked: false,
        refreshTokens: ['token1', 'token2']
      };

      mockSend.mockResolvedValue({
        Item: userData
      });

      const result = await userRepository.findByUsername(username);

      expect(mockSend).toHaveBeenCalled();
      expect(result).toBeInstanceOf(User);
      expect(result?.username).toBe(username);
      expect(result?.passwordHash).toBe(userData.passwordHash);
      expect(result?.roles).toEqual(userData.roles);
      expect(result?.blocked).toBe(userData.blocked);
      expect(result?.refreshTokens).toEqual(userData.refreshTokens);
    });

    it('should return null when user not found', async () => {
      const username = 'nonexistent';

      mockSend.mockResolvedValue({
        Item: undefined
      });

      const result = await userRepository.findByUsername(username);

      expect(mockSend).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle missing refreshTokens field', async () => {
      const username = 'testuser';
      const userData = {
        username,
        passwordHash: 'hashedPassword',
        roles: ['ROLE_USER'],
        blocked: false
        // refreshTokens field is missing
      };

      mockSend.mockResolvedValue({
        Item: userData
      });

      const result = await userRepository.findByUsername(username);

      expect(result).toBeInstanceOf(User);
      expect(result?.refreshTokens).toEqual([]);
    });
  });

  describe('findByRefreshToken', () => {
    it('should return user when refresh token found', async () => {
      const refreshToken = 'valid-refresh-token';
      const userData = {
        username: 'testuser',
        passwordHash: 'hashedPassword',
        roles: ['ROLE_USER'],
        blocked: false,
        refreshTokens: [refreshToken, 'other-token']
      };

      mockSend.mockResolvedValue({
        Items: [userData]
      });

      const result = await userRepository.findByRefreshToken(refreshToken);

      expect(mockSend).toHaveBeenCalled();
      expect(result).toBeInstanceOf(User);
      expect(result?.username).toBe(userData.username);
      expect(result?.refreshTokens).toContain(refreshToken);
    });

    it('should return null when refresh token not found', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockSend.mockResolvedValue({
        Items: []
      });

      const result = await userRepository.findByRefreshToken(refreshToken);

      expect(result).toBeNull();
    });

    it('should return null when Items is undefined', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockSend.mockResolvedValue({
        Items: undefined
      });

      const result = await userRepository.findByRefreshToken(refreshToken);

      expect(result).toBeNull();
    });

    it('should handle missing refreshTokens field in scan result', async () => {
      const refreshToken = 'valid-refresh-token';
      const userData = {
        username: 'testuser',
        passwordHash: 'hashedPassword',
        roles: ['ROLE_USER'],
        blocked: false
        // refreshTokens field is missing
      };

      mockSend.mockResolvedValue({
        Items: [userData]
      });

      const result = await userRepository.findByRefreshToken(refreshToken);

      expect(result).toBeInstanceOf(User);
      expect(result?.refreshTokens).toEqual([]);
    });
  });

  describe('save', () => {
    it('should save user successfully', async () => {
      const user = new User('testuser', 'hashedPassword', ['ROLE_USER'], false, ['token1']);

      mockSend.mockResolvedValue({});

      await userRepository.save(user);

      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token for existing user', async () => {
      const username = 'testuser';
      const refreshToken = 'new-refresh-token';
      const userData = {
        username,
        passwordHash: 'hashedPassword',
        roles: ['ROLE_USER'],
        blocked: false,
        refreshTokens: ['existing-token']
      };

      // Mock findByUsername call
      mockSend.mockResolvedValueOnce({
        Item: userData
      });
      // Mock save call
      mockSend.mockResolvedValueOnce({});

      await userRepository.saveRefreshToken(username, refreshToken);

      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('should throw error when user not found', async () => {
      const username = 'nonexistent';
      const refreshToken = 'new-refresh-token';

      // Mock findByUsername returning null
      mockSend.mockResolvedValue({
        Item: undefined
      });

      await expect(userRepository.saveRefreshToken(username, refreshToken))
        .rejects.toThrow('User not found');

      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeRefreshToken', () => {
    it('should remove refresh token from existing user', async () => {
      const refreshTokenToRemove = 'token-to-remove';
      const userData = {
        username: 'testuser',
        passwordHash: 'hashedPassword',
        roles: ['ROLE_USER'],
        blocked: false,
        refreshTokens: [refreshTokenToRemove, 'other-token']
      };

      // Mock findByRefreshToken call
      mockSend.mockResolvedValueOnce({
        Items: [userData]
      });
      // Mock save call
      mockSend.mockResolvedValueOnce({});

      await userRepository.removeRefreshToken(refreshTokenToRemove);

      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('should return early when refresh token not found', async () => {
      const refreshToken = 'nonexistent-token';

      // Mock findByRefreshToken returning null
      mockSend.mockResolvedValue({
        Items: []
      });

      await userRepository.removeRefreshToken(refreshToken);

      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should handle user with no refresh tokens', async () => {
      const refreshTokenToRemove = 'token-to-remove';
      const userData = {
        username: 'testuser',
        passwordHash: 'hashedPassword',
        roles: ['ROLE_USER'],
        blocked: false,
        refreshTokens: []
      };

      // Mock findByRefreshToken call
      mockSend.mockResolvedValueOnce({
        Items: [userData]
      });
      // Mock save call
      mockSend.mockResolvedValueOnce({});

      await userRepository.removeRefreshToken(refreshTokenToRemove);

      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateBlocked', () => {
    it('should update blocked status for existing user', async () => {
      const username = 'testuser';
      const userData = {
        username,
        passwordHash: 'hashedPassword',
        roles: ['ROLE_USER'],
        blocked: false,
        refreshTokens: ['token1']
      };

      // Mock findByUsername call
      mockSend.mockResolvedValueOnce({
        Item: userData
      });
      // Mock save call
      mockSend.mockResolvedValueOnce({});

      await userRepository.updateBlocked(username, true);

      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('should throw error when user not found', async () => {
      const username = 'nonexistent';

      // Mock findByUsername returning null
      mockSend.mockResolvedValue({
        Item: undefined
      });

      await expect(userRepository.updateBlocked(username, true))
        .rejects.toThrow('User not found');

      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should update blocked status to false', async () => {
      const username = 'testuser';
      const userData = {
        username,
        passwordHash: 'hashedPassword',
        roles: ['ROLE_USER'],
        blocked: true,
        refreshTokens: ['token1']
      };

      // Mock findByUsername call
      mockSend.mockResolvedValueOnce({
        Item: userData
      });
      // Mock save call
      mockSend.mockResolvedValueOnce({});

      await userRepository.updateBlocked(username, false);

      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      const username = 'testuser';

      mockSend.mockResolvedValue({});

      await userRepository.remove(username);

      expect(mockSend).toHaveBeenCalled();
    });
  });
}); 