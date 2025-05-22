import { UserRepository } from '../infrastructure/UserRepository';
import { UserDomain } from '../domain/UserDomain';

export class LogoutUseCase {
  private userRepository = new UserRepository();
  private userDomain = new UserDomain(this.userRepository);

  async execute(refreshToken: string): Promise<void> {
    await this.userDomain.logout(refreshToken);
  }
} 