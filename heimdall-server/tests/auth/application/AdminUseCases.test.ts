import { UnblockUserUseCase } from '../../../src/auth/application/UnblockUserUseCase';
import { RemoveUserUseCase } from '../../../src/auth/application/RemoveUserUseCase';

// Mock dependencies
jest.mock('../../../src/auth/infrastructure/UserRepository');

const mockUnblockUser = jest.fn();
const mockRemoveUser = jest.fn();

jest.mock('../../../src/auth/domain/UserDomain', () => {
  return {
    UserDomain: jest.fn().mockImplementation(() => ({
      unblockUser: mockUnblockUser,
      removeUser: mockRemoveUser,
    })),
  };
});

describe('Admin Use Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UnblockUserUseCase', () => {
    let unblockUserUseCase: UnblockUserUseCase;

    beforeEach(() => {
      unblockUserUseCase = new UnblockUserUseCase();
    });

    describe('execute', () => {
      it('should call userDomain.unblockUser with correct username', async () => {
        const username = 'blockeduser';

        mockUnblockUser.mockResolvedValue(undefined);

        await unblockUserUseCase.execute(username);

        expect(mockUnblockUser).toHaveBeenCalledWith(username);
      });

      it('should propagate errors from userDomain.unblockUser', async () => {
        const username = 'nonexistent';
        const error = new Error('User not found');

        mockUnblockUser.mockRejectedValue(error);

        await expect(unblockUserUseCase.execute(username)).rejects.toThrow('User not found');
        expect(mockUnblockUser).toHaveBeenCalledWith(username);
      });

      it('should handle already unblocked user', async () => {
        const username = 'activeuser';
        const error = new Error('User already unblocked');

        mockUnblockUser.mockRejectedValue(error);

        await expect(unblockUserUseCase.execute(username)).rejects.toThrow('User already unblocked');
      });
    });
  });

  describe('RemoveUserUseCase', () => {
    let removeUserUseCase: RemoveUserUseCase;

    beforeEach(() => {
      removeUserUseCase = new RemoveUserUseCase();
    });

    describe('execute', () => {
      it('should call userDomain.removeUser with correct username', async () => {
        const username = 'usertoremove';

        mockRemoveUser.mockResolvedValue(undefined);

        await removeUserUseCase.execute(username);

        expect(mockRemoveUser).toHaveBeenCalledWith(username);
      });

      it('should propagate errors from userDomain.removeUser', async () => {
        const username = 'nonexistent';
        const error = new Error('User not found');

        mockRemoveUser.mockRejectedValue(error);

        await expect(removeUserUseCase.execute(username)).rejects.toThrow('User not found');
        expect(mockRemoveUser).toHaveBeenCalledWith(username);
      });

      it('should handle empty username', async () => {
        const username = '';
        const error = new Error('Username is required');

        mockRemoveUser.mockRejectedValue(error);

        await expect(removeUserUseCase.execute(username)).rejects.toThrow('Username is required');
      });
    });
  });
}); 