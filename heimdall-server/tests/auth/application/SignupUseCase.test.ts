import { SignupUseCase } from '../../../src/auth/application/SignupUseCase';
import { User } from '../../../src/auth/domain/User';

// Mock dependencies
jest.mock('../../../src/auth/infrastructure/UserRepository');

const mockSignup = jest.fn();

jest.mock('../../../src/auth/domain/UserDomain', () => {
  return {
    UserDomain: jest.fn().mockImplementation(() => ({
      signup: mockSignup,
    })),
  };
});

describe('SignupUseCase', () => {
  let signupUseCase: SignupUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    signupUseCase = new SignupUseCase();
  });

  describe('execute', () => {
    it('should call userDomain.signup with correct parameters', async () => {
      const username = 'newuser';
      const password = 'password123';
      const expectedUser = new User(username, 'hashedPassword', ['ROLE_USER']);

      mockSignup.mockResolvedValue(expectedUser);

      const result = await signupUseCase.execute(username, password);

      expect(mockSignup).toHaveBeenCalledWith(username, password);
      expect(result).toBe(expectedUser);
    });

    it('should propagate errors from userDomain.signup', async () => {
      const username = 'existinguser';
      const password = 'password123';
      const error = new Error('User already exists');

      mockSignup.mockRejectedValue(error);

      await expect(signupUseCase.execute(username, password)).rejects.toThrow('User already exists');
      expect(mockSignup).toHaveBeenCalledWith(username, password);
    });

    it('should handle invalid username', async () => {
      const username = '';
      const password = 'password123';
      const error = new Error('Username is required');

      mockSignup.mockRejectedValue(error);

      await expect(signupUseCase.execute(username, password)).rejects.toThrow('Username is required');
    });

    it('should handle weak password', async () => {
      const username = 'newuser';
      const password = '123';
      const error = new Error('Password too weak');

      mockSignup.mockRejectedValue(error);

      await expect(signupUseCase.execute(username, password)).rejects.toThrow('Password too weak');
    });
  });
}); 