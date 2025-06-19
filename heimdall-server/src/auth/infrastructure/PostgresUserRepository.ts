import { Repository, getRepository } from 'typeorm';
import { User } from '../domain/User';
import { UserRepository } from './UserRepository';
import { AppDataSource } from '../../config/data-source';

export class PostgresUserRepository implements UserRepository {
  private repository: Repository<User>;

  constructor(repository: Repository<User> = getRepository(User)) {
    this.repository = repository;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .where(':token = ANY(user.refreshTokens)', { token: refreshToken })
      .getOne();
  }

  async save(user: User): Promise<void> {
    await this.repository.save(user);
  }

  async saveRefreshToken(username: string, refreshToken: string): Promise<void> {
    const user = await this.findByUsername(username);
    if (!user) throw new Error('User not found');
    user.refreshTokens.push(refreshToken);
    await this.save(user);
  }

  async removeRefreshToken(refreshToken: string): Promise<void> {
    const user = await this.findByRefreshToken(refreshToken);
    if (!user) return;
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    await this.save(user);
  }

  async updateBlocked(username: string, blocked: boolean): Promise<void> {
    const user = await this.findByUsername(username);
    if (!user) throw new Error('User not found');
    user.blocked = blocked;
    await this.save(user);
  }

  async remove(username: string): Promise<void> {
    await this.repository.delete(username);
  }
} 