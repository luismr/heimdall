import { LogoutUseCase } from '../../../src/auth/application/LogoutUseCase';

// Mock dependencies
jest.mock('../../../src/auth/infrastructure/UserRepository');

const mockLogout = jest.fn();

jest.mock('../../../src/auth/domain/UserDomain', () => {
  return {
    UserDomain: jest.fn().mockImplementation(() => ({
      logout: mockLogout,
    })),
  };
});

describe('LogoutUseCase', () => {
  let logoutUseCase: LogoutUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    logoutUseCase = new LogoutUseCase();
  });

  describe('execute', () => {
    it('should call userDomain.logout with correct refresh token', async () => {
      const refreshToken = 'valid-refresh-token';

      mockLogout.mockResolvedValue(undefined);

      await logoutUseCase.execute(refreshToken);

      expect(mockLogout).toHaveBeenCalledWith(refreshToken);
    });

    it('should propagate errors from userDomain.logout', async () => {
      const refreshToken = 'invalid-refresh-token';
      const error = new Error('Invalid refresh token');

      mockLogout.mockRejectedValue(error);

      await expect(logoutUseCase.execute(refreshToken)).rejects.toThrow('Invalid refresh token');
      expect(mockLogout).toHaveBeenCalledWith(refreshToken);
    });

    it('should handle empty refresh token', async () => {
      const refreshToken = '';
      const error = new Error('Refresh token is required');

      mockLogout.mockRejectedValue(error);

      await expect(logoutUseCase.execute(refreshToken)).rejects.toThrow('Refresh token is required');
    });

    it('should handle null refresh token', async () => {
      const refreshToken = null as any;
      const error = new Error('Refresh token is required');

      mockLogout.mockRejectedValue(error);

      await expect(logoutUseCase.execute(refreshToken)).rejects.toThrow('Refresh token is required');
    });
  });
}); 