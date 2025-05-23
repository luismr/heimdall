import { UserRepository } from '../infrastructure/UserRepository';
import { UserDomain } from '../domain/UserDomain';
import { User } from '../domain/User';

export class LoginUseCase {
  private userRepository = new UserRepository();
  private userDomain = new UserDomain(this.userRepository);

  async execute(username: string, password: string): Promise<{ user: User, accessToken: string, refreshToken: string }> {
    return this.userDomain.login(username, password);
  }
} 