import { LogoutUseCase } from '../../../src/auth/application/LogoutUseCase';
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

describe('LogoutUseCase', () => {
  let logoutUseCase: LogoutUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    logoutUseCase = new LogoutUseCase();
  });

  describe('execute', () => {
    it('should logout a user by removing the refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const user = new User('testuser', 'hashedPassword', ['ROLE_USER'], false, [refreshToken]);
      
      mockRepository.findByRefreshToken.mockResolvedValue(user);
      (mockRepository.save as jest.Mock).mockResolvedValue(undefined);

      await logoutUseCase.execute(refreshToken);

      expect(mockRepository.findByRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        username: user.username,
        refreshTokens: []
      }));
    });

    it('should not throw an error if the refresh token does not exist', async () => {
      const refreshToken = 'invalid-refresh-token';
      mockRepository.findByRefreshToken.mockResolvedValue(null);
      
      await expect(logoutUseCase.execute(refreshToken)).resolves.not.toThrow();
      expect(mockRepository.findByRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
}); 