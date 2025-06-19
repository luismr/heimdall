import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from './User';
import type { UserDomain } from './UserDomain';
import type { UserRepository } from '../infrastructure/UserRepository';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';
const BCRYPT_SALT_ROUNDS = 10;

export class DefaultUserDomain implements UserDomain {
  constructor(private userRepository: UserRepository) {}

  private generateAccessToken(username: string, roles: string[]): string {
    return jwt.sign({ username, roles }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  private generateRefreshToken(username: string): string {
    return jwt.sign({ username }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
  }

  async signup(username: string, password: string): Promise<User> {
    if (!username || username.trim().length === 0) {
      throw new Error('Username is required');
    }
    if (!password || password.length < 6) {
      throw new Error('Password is too weak');
    }

    const existing = await this.userRepository.findByUsername(username);
    if (existing) throw new Error('User already exists');
    
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = new User(username, hashedPassword, ['ROLE_USER'], false, []);
    await this.userRepository.save(user);
    return user;
  }

  async login(username: string, password: string): Promise<{ user: User, accessToken: string, refreshToken: string }> {
    const user = await this.userRepository.findByUsername(username);
    if (!user || user.blocked) {
      throw new Error('Invalid credentials or user blocked');
    }
    
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    const accessToken = this.generateAccessToken(user.username, user.roles);
    const refreshToken = this.generateRefreshToken(user.username);
    user.refreshTokens.push(refreshToken);
    await this.userRepository.save(user);
    
    return { user, accessToken, refreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    const user = await this.userRepository.findByRefreshToken(refreshToken);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
      await this.userRepository.save(user);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string, newRefreshToken?: string }> {
    const user = await this.userRepository.findByRefreshToken(refreshToken);
    if (!user || !user.refreshTokens.includes(refreshToken) || user.blocked) {
      throw new Error('Invalid refresh token or user blocked');
    }

    try {
      jwt.verify(refreshToken, JWT_SECRET);
      const accessToken = this.generateAccessToken(user.username, user.roles);
      const newRefreshToken = this.generateRefreshToken(user.username);
      
      user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
      user.refreshTokens.push(newRefreshToken);
      await this.userRepository.save(user);
      
      return { accessToken, newRefreshToken };
    } catch (_error) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
      await this.userRepository.save(user);
      throw new Error('Refresh token expired or invalid, please login again.');
    }
  }

  async blockUser(username: string): Promise<void> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.blocked) {
      throw new Error('User already blocked');
    }
    
    user.blocked = true;
    await this.userRepository.save(user);
  }

  async unblockUser(username: string): Promise<void> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.blocked) {
      throw new Error('User already unblocked');
    }
    
    user.blocked = false;
    await this.userRepository.save(user);
  }

  async removeUser(username: string): Promise<void> {
    await this.userRepository.remove(username);
  }
} 