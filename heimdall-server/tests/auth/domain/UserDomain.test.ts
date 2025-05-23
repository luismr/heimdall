import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserDomain } from '../../../src/auth/domain/UserDomain';
import { User } from '../../../src/auth/domain/User';
import { UserRepository } from '../../../src/auth/infrastructure/UserRepository';

// Mock the UserRepository
jest.mock('../../../src/auth/infrastructure/UserRepository');

const mockUserRepository = {
  findByUsername: jest.fn(),
  findByRefreshToken: jest.fn(),
  save: jest.fn(),
  saveRefreshToken: jest.fn(),
  removeRefreshToken: jest.fn(),
  updateBlocked: jest.fn(),
  remove: jest.fn(),
} as jest.Mocked<UserRepository>;

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

describe('UserDomain', () => {
  let userDomain: UserDomain;

  beforeEach(() => {
    jest.clearAllMocks();
    userDomain = new UserDomain(mockUserRepository);
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const username = 'newuser';
      const password = 'password123';
      
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(undefined);

      const result = await userDomain.signup(username, password);

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          username,
          roles: ['ROLE_USER'],
          blocked: false,
          refreshTokens: []
        })
      );
      expect(result.username).toBe(username);
      expect(result.roles).toEqual(['ROLE_USER']);
      expect(result.blocked).toBe(false);
      // Verify password is hashed
      expect(await bcrypt.compare(password, result.passwordHash)).toBe(true);
    });

    it('should throw error if user already exists', async () => {
      const username = 'existinguser';
      const password = 'password123';
      const existingUser = new User(username, 'hashedPassword', ['ROLE_USER']);
      
      mockUserRepository.findByUsername.mockResolvedValue(existingUser);

      await expect(userDomain.signup(username, password)).rejects.toThrow('User already exists');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const username = 'testuser';
    const password = 'password123';
    let hashedPassword: string;
    let user: User;

    beforeEach(async () => {
      hashedPassword = await bcrypt.hash(password, 10);
      user = new User(username, hashedPassword, ['ROLE_USER'], false, []);
    });

    it('should login successfully with valid credentials', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(undefined);

      const result = await userDomain.login(username, password);

      expect(result.user).toBe(user);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
      
      // Verify tokens are valid
      const accessPayload = jwt.verify(result.accessToken, JWT_SECRET) as any;
      expect(accessPayload.username).toBe(username);
      expect(accessPayload.roles).toEqual(['ROLE_USER']);
      
      const refreshPayload = jwt.verify(result.refreshToken, JWT_SECRET) as any;
      expect(refreshPayload.username).toBe(username);
    });

    it('should throw error if user does not exist', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);

      await expect(userDomain.login(username, password)).rejects.toThrow('Invalid credentials or user blocked');
    });

    it('should throw error if user is blocked', async () => {
      const blockedUser = new User(username, hashedPassword, ['ROLE_USER'], true, []);
      mockUserRepository.findByUsername.mockResolvedValue(blockedUser);

      await expect(userDomain.login(username, password)).rejects.toThrow('Invalid credentials or user blocked');
    });

    it('should throw error for invalid password', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(user);

      await expect(userDomain.login(username, 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should remove refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const user = new User('testuser', 'hashedPassword', ['ROLE_USER'], false, [refreshToken]);
      
      mockUserRepository.findByRefreshToken.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(undefined);

      await userDomain.logout(refreshToken);

      expect(mockUserRepository.findByRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
      expect(user.refreshTokens).not.toContain(refreshToken);
    });

    it('should handle logout when user not found', async () => {
      const refreshToken = 'invalid-refresh-token';
      mockUserRepository.findByRefreshToken.mockResolvedValue(null);

      await userDomain.logout(refreshToken);

      expect(mockUserRepository.findByRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    const username = 'testuser';

    it('should refresh access token successfully', async () => {
      const validRefreshToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
      const user = new User(username, 'hashedPassword', ['ROLE_USER'], false, [validRefreshToken]);
      
      mockUserRepository.findByRefreshToken.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(undefined);

      const result = await userDomain.refreshAccessToken(validRefreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.newRefreshToken).toBeDefined();
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
      
      // Check that the user object was modified correctly
      expect(user.refreshTokens.length).toBe(1); // Should still have 1 token (the new one)
      expect(user.refreshTokens[0]).toBe(result.newRefreshToken); // Should be the new token
      
      // Verify new access token
      const payload = jwt.verify(result.accessToken, JWT_SECRET) as any;
      expect(payload.username).toBe(username);
    });

    it('should throw error if user not found', async () => {
      const validRefreshToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
      mockUserRepository.findByRefreshToken.mockResolvedValue(null);

      await expect(userDomain.refreshAccessToken(validRefreshToken)).rejects.toThrow('Invalid refresh token or user blocked');
    });

    it('should throw error if user is blocked', async () => {
      const validRefreshToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
      const blockedUser = new User(username, 'hashedPassword', ['ROLE_USER'], true, [validRefreshToken]);
      mockUserRepository.findByRefreshToken.mockResolvedValue(blockedUser);

      await expect(userDomain.refreshAccessToken(validRefreshToken)).rejects.toThrow('Invalid refresh token or user blocked');
    });

    it('should throw error if refresh token not in user tokens', async () => {
      const validRefreshToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
      const userWithoutToken = new User(username, 'hashedPassword', ['ROLE_USER'], false, []);
      mockUserRepository.findByRefreshToken.mockResolvedValue(userWithoutToken);

      await expect(userDomain.refreshAccessToken(validRefreshToken)).rejects.toThrow('Invalid refresh token or user blocked');
    });

    it('should handle expired refresh token', async () => {
      const expiredToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1ms' });
      const userWithExpiredToken = new User(username, 'hashedPassword', ['ROLE_USER'], false, [expiredToken]);
      
      mockUserRepository.findByRefreshToken.mockResolvedValue(userWithExpiredToken);
      mockUserRepository.save.mockResolvedValue(undefined);

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10));

      await expect(userDomain.refreshAccessToken(expiredToken)).rejects.toThrow('Refresh token expired or invalid, please login again.');
      
      // Verify expired token is removed
      expect(mockUserRepository.save).toHaveBeenCalledWith(userWithExpiredToken);
      expect(userWithExpiredToken.refreshTokens).not.toContain(expiredToken);
    });
  });

  describe('blockUser', () => {
    it('should block user successfully', async () => {
      const username = 'testuser';
      const user = new User(username, 'hashedPassword', ['ROLE_USER'], false, []);
      
      mockUserRepository.findByUsername.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(undefined);

      await userDomain.blockUser(username);

      expect(user.blocked).toBe(true);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);

      await expect(userDomain.blockUser('nonexistent')).rejects.toThrow('User not found');
    });

    it('should throw error if user already blocked', async () => {
      const username = 'testuser';
      const blockedUser = new User(username, 'hashedPassword', ['ROLE_USER'], true, []);
      
      mockUserRepository.findByUsername.mockResolvedValue(blockedUser);

      await expect(userDomain.blockUser(username)).rejects.toThrow('User already blocked');
    });
  });

  describe('unblockUser', () => {
    it('should unblock user successfully', async () => {
      const username = 'testuser';
      const user = new User(username, 'hashedPassword', ['ROLE_USER'], true, []);
      
      mockUserRepository.findByUsername.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(undefined);

      await userDomain.unblockUser(username);

      expect(user.blocked).toBe(false);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);

      await expect(userDomain.unblockUser('nonexistent')).rejects.toThrow('User not found');
    });

    it('should throw error if user already unblocked', async () => {
      const username = 'testuser';
      const unblockedUser = new User(username, 'hashedPassword', ['ROLE_USER'], false, []);
      
      mockUserRepository.findByUsername.mockResolvedValue(unblockedUser);

      await expect(userDomain.unblockUser(username)).rejects.toThrow('User already unblocked');
    });
  });

  describe('removeUser', () => {
    it('should remove user successfully', async () => {
      const username = 'testuser';
      mockUserRepository.remove.mockResolvedValue(undefined);

      await userDomain.removeUser(username);

      expect(mockUserRepository.remove).toHaveBeenCalledWith(username);
    });
  });
}); 