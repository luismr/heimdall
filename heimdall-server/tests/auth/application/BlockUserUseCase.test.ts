import { BlockUserUseCase } from '../../../src/auth/application/BlockUserUseCase';

// Mock dependencies
jest.mock('../../../src/auth/infrastructure/UserRepository');

const mockBlockUser = jest.fn();

jest.mock('../../../src/auth/domain/UserDomain', () => {
  return {
    UserDomain: jest.fn().mockImplementation(() => ({
      blockUser: mockBlockUser,
    })),
  };
});

describe('BlockUserUseCase', () => {
  let blockUserUseCase: BlockUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    blockUserUseCase = new BlockUserUseCase();
  });

  describe('execute', () => {
    it('should call userDomain.blockUser with correct username', async () => {
      const username = 'testuser';

      mockBlockUser.mockResolvedValue(undefined);

      await blockUserUseCase.execute(username);

      expect(mockBlockUser).toHaveBeenCalledWith(username);
    });

    it('should propagate errors from userDomain.blockUser', async () => {
      const username = 'nonexistent';
      const error = new Error('User not found');

      mockBlockUser.mockRejectedValue(error);

      await expect(blockUserUseCase.execute(username)).rejects.toThrow('User not found');
      expect(mockBlockUser).toHaveBeenCalledWith(username);
    });

    it('should handle already blocked user', async () => {
      const username = 'blockeduser';
      const error = new Error('User already blocked');

      mockBlockUser.mockRejectedValue(error);

      await expect(blockUserUseCase.execute(username)).rejects.toThrow('User already blocked');
    });
  });
}); 