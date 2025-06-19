import { UnblockUserUseCase } from '../../../src/auth/application/UnblockUserUseCase';
import { RemoveUserUseCase } from '../../../src/auth/application/RemoveUserUseCase';
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

describe('Admin Use Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UnblockUserUseCase', () => {
    let unblockUserUseCase: UnblockUserUseCase;

    beforeEach(() => {
      unblockUserUseCase = new UnblockUserUseCase();
    });

    it('should unblock a user successfully', async () => {
      const username = 'blockeduser';
      const user = new User(username, 'hashedPassword', ['ROLE_USER'], true, []);
      mockRepository.findByUsername.mockResolvedValue(user);
      (mockRepository.save as jest.Mock).mockResolvedValue(undefined);

      await unblockUserUseCase.execute(username);

      expect(mockRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        username,
        blocked: false,
      }));
    });

    it('should throw an error if user is not found', async () => {
      const username = 'nonexistent';
      mockRepository.findByUsername.mockResolvedValue(null);
      await expect(unblockUserUseCase.execute(username)).rejects.toThrow('User not found');
    });

    it('should throw an error if user is already unblocked', async () => {
      const username = 'unblockeduser';
      const user = new User(username, 'hashedPassword', ['ROLE_USER'], false, []);
      mockRepository.findByUsername.mockResolvedValue(user);
      await expect(unblockUserUseCase.execute(username)).rejects.toThrow('User already unblocked');
    });
  });

  describe('RemoveUserUseCase', () => {
    let removeUserUseCase: RemoveUserUseCase;

    beforeEach(() => {
      removeUserUseCase = new RemoveUserUseCase();
    });

    it('should remove a user successfully', async () => {
      const username = 'usertoremove';
      (mockRepository.remove as jest.Mock).mockResolvedValue(undefined);
      await removeUserUseCase.execute(username);
      expect(mockRepository.remove).toHaveBeenCalledWith(username);
    });
  });
}); 