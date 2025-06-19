import { User } from '../domain/User';

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>;
  findByRefreshToken(refreshToken: string): Promise<User | null>;
  save(user: User): Promise<void>;
  saveRefreshToken(username: string, refreshToken: string): Promise<void>;
  removeRefreshToken(refreshToken: string): Promise<void>;
  updateBlocked(username: string, blocked: boolean): Promise<void>;
  remove(username: string): Promise<void>;
} 