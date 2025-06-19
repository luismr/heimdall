import { BlockUserUseCase } from '../../../src/auth/application/BlockUserUseCase';
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

describe('BlockUserUseCase', () => {
  let blockUserUseCase: BlockUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    blockUserUseCase = new BlockUserUseCase();
  });

  describe('execute', () => {
    it('should block a user successfully', async () => {
      const username = 'testuser';
      const user = new User(username, 'hashedPassword', ['ROLE_USER'], false, []);
      
      mockRepository.findByUsername.mockResolvedValue(user);
      (mockRepository.save as jest.Mock).mockResolvedValue(undefined);

      await blockUserUseCase.execute(username);

      expect(mockRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        username,
        blocked: true
      }));
    });

    it('should throw error when user not found', async () => {
      const username = 'nonexistent';
      
      mockRepository.findByUsername.mockResolvedValue(null);

      await expect(blockUserUseCase.execute(username)).rejects.toThrow('User not found');
      expect(mockRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when user is already blocked', async () => {
      const username = 'blockeduser';
      const user = new User(username, 'hashedPassword', ['ROLE_USER'], true, []);
      
      mockRepository.findByUsername.mockResolvedValue(user);

      await expect(blockUserUseCase.execute(username)).rejects.toThrow('User already blocked');
      expect(mockRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
}); 