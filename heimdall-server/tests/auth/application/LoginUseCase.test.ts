import { LoginUseCase } from '../../../src/auth/application/LoginUseCase';
import { User } from '../../../src/auth/domain/User';
import { UserRepository } from '../../../src/auth/infrastructure/UserRepository';
import { UserRepositoryFactory } from '../../../src/auth/infrastructure/UserRepositoryFactory';

jest.mock('../../../src/auth/infrastructure/UserRepositoryFactory');

const mockRepository: jest.Mocked<UserRepository> = {
  findByUsername: jest.fn(),
  findByRefreshToken: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  saveRefreshToken: jest.fn(),
  removeRefreshToken: jest.fn(),
  updateBlocked: jest.fn(),
};

(UserRepositoryFactory.create as jest.Mock).mockReturnValue(mockRepository);

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    loginUseCase = new LoginUseCase();
  });

  describe('execute', () => {
    it('should login successfully and return tokens', async () => {
      const username = 'testuser';
      const password = 'password123';
      const user = new User(username, 'hashedPassword', ['ROLE_USER'], false, []);
      jest.spyOn(user, 'verifyPassword').mockResolvedValue(true);

      mockRepository.findByUsername.mockResolvedValue(user);
      (mockRepository.save as jest.Mock).mockResolvedValue(undefined);

      const result = await loginUseCase.execute(username, password);

      expect(result.user).toEqual(user);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(user.verifyPassword).toHaveBeenCalledWith(password);
      expect(mockRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw an error for invalid credentials if user does not exist', async () => {
      const username = 'testuser';
      const password = 'password123';
      mockRepository.findByUsername.mockResolvedValue(null);
      await expect(loginUseCase.execute(username, password)).rejects.toThrow('Invalid credentials or user blocked');
    });

    it('should throw an error if the user is blocked', async () => {
      const username = 'testuser';
      const password = 'password123';
      const user = new User(username, 'hashedPassword', ['ROLE_USER'], true, []);
      mockRepository.findByUsername.mockResolvedValue(user);
      await expect(loginUseCase.execute(username, password)).rejects.toThrow('Invalid credentials or user blocked');
    });

    it('should throw an error for invalid credentials if password is wrong', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';
      const user = new User(username, 'hashedPassword', ['ROLE_USER'], false, []);
      jest.spyOn(user, 'verifyPassword').mockResolvedValue(false);
      mockRepository.findByUsername.mockResolvedValue(user);
      await expect(loginUseCase.execute(username, password)).rejects.toThrow('Invalid credentials');
    });
  });
}); 