import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DefaultUserDomain } from '../../../src/auth/domain/DefaultUserDomain';
import { User } from '../../../src/auth/domain/User';
import { UserRepository } from '../../../src/auth/infrastructure/UserRepository';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockRepository: jest.Mocked<UserRepository> = {
  findByUsername: jest.fn(),
  findByRefreshToken: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  saveRefreshToken: jest.fn(),
  removeRefreshToken: jest.fn(),
  updateBlocked: jest.fn(),
};

describe('DefaultUserDomain', () => {
  let userDomain: DefaultUserDomain;

  beforeEach(() => {
    jest.clearAllMocks();
    userDomain = new DefaultUserDomain(mockRepository);
  });

  describe('signup', () => {
    it('should create and save a new user', async () => {
      const username = 'newuser';
      const password = 'password123';
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockRepository.findByUsername.mockResolvedValue(null);
      
      const user = await userDomain.signup(username, password);

      expect(user.username).toBe(username);
      expect(mockRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw error if user already exists', async () => {
      const username = 'existinguser';
      const password = 'password123';
      mockRepository.findByUsername.mockResolvedValue(new User(username, 'pass', [], false, []));

      await expect(userDomain.signup(username, password)).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const username = 'testuser';
      const password = 'password123';
      const user = new User(username, 'hashedPassword', ['ROLE_USER'], false, []);
      jest.spyOn(user, 'verifyPassword').mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('fake-token');
      mockRepository.findByUsername.mockResolvedValue(user);

      const result = await userDomain.login(username, password);

      expect(result.user).toBe(user);
      expect(result.accessToken).toBe('fake-token');
      expect(result.refreshToken).toBe('fake-token');
      expect(mockRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw error for blocked user', async () => {
      const username = 'blockeduser';
      const password = 'password123';
      const user = new User(username, 'hashedPassword', [], true, []);
      mockRepository.findByUsername.mockResolvedValue(user);

      await expect(userDomain.login(username, password)).rejects.toThrow('Invalid credentials or user blocked');
    });
  });
}); 