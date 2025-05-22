import { User } from './User';

export interface IUserDomain {
  signup(username: string, password: string): Promise<User>;
  login(username: string, password: string): Promise<{ user: User, accessToken: string, refreshToken: string }>;
  logout(refreshToken: string): Promise<void>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string, newRefreshToken?: string }>;
  blockUser(username: string): Promise<void>;
  unblockUser(username: string): Promise<void>;
  removeUser(username: string): Promise<void>;
} 