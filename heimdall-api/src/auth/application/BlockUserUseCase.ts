import { UserRepository } from '../infrastructure/UserRepository';
import { UserDomain } from '../domain/UserDomain';

export class BlockUserUseCase {
  private userRepository = new UserRepository();
  private userDomain = new UserDomain(this.userRepository);

  async execute(username: string): Promise<void> {
    await this.userDomain.blockUser(username);
  }
} 