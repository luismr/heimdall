import { UserRepository } from '../infrastructure/UserRepository';
import { UserDomain } from '../domain/UserDomain';

export class UnblockUserUseCase {
  private userRepository = new UserRepository();
  private userDomain = new UserDomain(this.userRepository);

  async execute(username: string): Promise<void> {
    await this.userDomain.unblockUser(username);
  }
} 