import bcrypt from 'bcrypt';
import { User } from '../../../src/auth/domain/User';

describe('User', () => {
  describe('constructor', () => {
    it('should create a user with all required properties', () => {
      const username = 'testuser';
      const passwordHash = 'hashedPassword123';
      const roles = ['ROLE_USER'];
      const blocked = false;
      const refreshTokens = ['token1', 'token2'];

      const user = new User(username, passwordHash, roles, blocked, refreshTokens);

      expect(user.username).toBe(username);
      expect(user.passwordHash).toBe(passwordHash);
      expect(user.roles).toEqual(roles);
      expect(user.blocked).toBe(blocked);
      expect(user.refreshTokens).toEqual(refreshTokens);
    });

    it('should create a user with default values for optional properties', () => {
      const username = 'testuser';
      const passwordHash = 'hashedPassword123';
      const roles = ['ROLE_USER'];

      const user = new User(username, passwordHash, roles);

      expect(user.username).toBe(username);
      expect(user.passwordHash).toBe(passwordHash);
      expect(user.roles).toEqual(roles);
      expect(user.blocked).toBe(false);
      expect(user.refreshTokens).toEqual([]);
    });

    it('should handle empty roles array', () => {
      const user = new User('testuser', 'hashedPassword123', []);

      expect(user.roles).toEqual([]);
    });

    it('should handle multiple roles', () => {
      const roles = ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_MODERATOR'];
      const user = new User('testuser', 'hashedPassword123', roles);

      expect(user.roles).toEqual(roles);
    });
  });

  describe('verifyPassword', () => {
    let user: User;
    const password = 'testPassword123';
    let hashedPassword: string;

    beforeEach(async () => {
      // Create a real hashed password for testing
      hashedPassword = await bcrypt.hash(password, 10);
      user = new User('testuser', hashedPassword, ['ROLE_USER']);
    });

    it('should return true for correct password', async () => {
      const result = await user.verifyPassword(password);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const result = await user.verifyPassword('wrongPassword');
      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const result = await user.verifyPassword('');
      expect(result).toBe(false);
    });

    it('should return false for null password', async () => {
      const result = await user.verifyPassword(null as any);
      expect(result).toBe(false);
    });

    it('should return false for undefined password', async () => {
      const result = await user.verifyPassword(undefined as any);
      expect(result).toBe(false);
    });

    it('should handle special characters in password', async () => {
      const specialPassword = 'p@ssw0rd!#$%^&*()';
      const specialHashedPassword = await bcrypt.hash(specialPassword, 10);
      const userWithSpecialPassword = new User('testuser', specialHashedPassword, ['ROLE_USER']);

      const result = await userWithSpecialPassword.verifyPassword(specialPassword);
      expect(result).toBe(true);
    });

    it('should be case sensitive', async () => {
      const result = await user.verifyPassword('TESTPASSWORD123');
      expect(result).toBe(false);
    });
  });
}); 