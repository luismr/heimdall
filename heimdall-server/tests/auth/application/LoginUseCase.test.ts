import { LoginUseCase } from '../../../src/auth/application/LoginUseCase';
import { UserDomain } from '../../../src/auth/domain/UserDomain';
import { User } from '../../../src/auth/domain/User';

// Mock dependencies
jest.mock('../../../src/auth/infrastructure/UserRepository');

const mockLogin = jest.fn();

jest.mock('../../../src/auth/domain/UserDomain', () => {
  return {
    UserDomain: jest.fn().mockImplementation(() => ({
      login: mockLogin,
    })),
  };
});

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    loginUseCase = new LoginUseCase();
  });

  describe('execute', () => {
    it('should call userDomain.login with correct parameters', async () => {
      const username = 'testuser';
      const password = 'password123';
      const expectedResult = {
        user: new User(username, 'hashedPassword', ['ROLE_USER']),
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      mockLogin.mockResolvedValue(expectedResult);

      const result = await loginUseCase.execute(username, password);

      expect(mockLogin).toHaveBeenCalledWith(username, password);
      expect(result).toBe(expectedResult);
    });

    it('should propagate errors from userDomain.login', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';
      const error = new Error('Invalid credentials');

      mockLogin.mockRejectedValue(error);

      await expect(loginUseCase.execute(username, password)).rejects.toThrow('Invalid credentials');
      expect(mockLogin).toHaveBeenCalledWith(username, password);
    });

    it('should handle empty username', async () => {
      const username = '';
      const password = 'password123';
      const error = new Error('Username is required');

      mockLogin.mockRejectedValue(error);

      await expect(loginUseCase.execute(username, password)).rejects.toThrow('Username is required');
    });

    it('should handle empty password', async () => {
      const username = 'testuser';
      const password = '';
      const error = new Error('Password is required');

      mockLogin.mockRejectedValue(error);

      await expect(loginUseCase.execute(username, password)).rejects.toThrow('Password is required');
    });
  });
}); 