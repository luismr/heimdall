import 'reflect-metadata';
import { PostgresUserRepository } from "../../../src/auth/infrastructure/PostgresUserRepository";
import { User } from "../../../src/auth/domain/User";
import { Repository } from "typeorm";

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

const mockRepository: jest.Mocked<Repository<User>> = {
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
} as any;

describe('PostgresUserRepository', () => {
    let userRepository: PostgresUserRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        userRepository = new PostgresUserRepository(mockRepository);
    });

    describe('findByUsername', () => {
        it('should return a user if found', async () => {
            const user = new User('test', 'test', [], false, []);
            mockRepository.findOne.mockResolvedValue(user);
            const result = await userRepository.findByUsername('test');
            expect(result).toEqual(user);
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { username: 'test' } });
        });

        it('should return null if not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            const result = await userRepository.findByUsername('test');
            expect(result).toBeNull();
        });
    });

    describe('save', () => {
        it('should save the user', async () => {
            const user = new User('test', 'test', [], false, []);
            await userRepository.save(user);
            expect(mockRepository.save).toHaveBeenCalledWith(user);
        });
    });

    describe('remove', () => {
        it('should remove the user', async () => {
            await userRepository.remove('test');
            expect(mockRepository.delete).toHaveBeenCalledWith('test');
        });
    });

    describe('findByRefreshToken', () => {
      it('should return a user if token is found', async () => {
          const user = new User('test', 'test', [], false, ['token']);
          mockQueryBuilder.getOne.mockResolvedValue(user);
          const result = await userRepository.findByRefreshToken('token');
          expect(result).toEqual(user);
      });

      it('should return null if token is not found', async () => {
          mockQueryBuilder.getOne.mockResolvedValue(null);
          const result = await userRepository.findByRefreshToken('token');
          expect(result).toBeNull();
      });
  });
}); 