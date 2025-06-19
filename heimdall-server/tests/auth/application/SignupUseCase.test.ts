import { SignupUseCase } from '../../../src/auth/application/SignupUseCase';
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

describe('SignupUseCase', () => {
  let signupUseCase: SignupUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    signupUseCase = new SignupUseCase();
  });

  describe('execute', () => {
    it('should create and save a new user', async () => {
      const username = 'newuser';
      const password = 'password123';
      
      mockRepository.findByUsername.mockResolvedValue(null);
      (mockRepository.save as jest.Mock).mockResolvedValue(undefined);

      const result = await signupUseCase.execute(username, password);

      expect(result).toBeInstanceOf(User);
      expect(result.username).toBe(username);
      expect(mockRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(User));
    });

    it('should throw an error if the user already exists', async () => {
      const username = 'existinguser';
      const password = 'password123';
      const existingUser = new User(username, 'hashedPassword', [], false, []);

      mockRepository.findByUsername.mockResolvedValue(existingUser);
      
      await expect(signupUseCase.execute(username, password)).rejects.toThrow('User already exists');
      expect(mockRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error for an empty username', async () => {
      await expect(signupUseCase.execute('', 'password123')).rejects.toThrow('Username is required');
      expect(mockRepository.findByUsername).not.toHaveBeenCalled();
    });

    it('should throw an error for a weak password', async () => {
      await expect(signupUseCase.execute('testuser', '123')).rejects.toThrow('Password is too weak');
      expect(mockRepository.findByUsername).not.toHaveBeenCalled();
    });
  });
}); 