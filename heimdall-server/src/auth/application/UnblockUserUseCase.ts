import { UserRepositoryFactory } from '../infrastructure/UserRepositoryFactory';
import { DefaultUserDomain } from '../domain/DefaultUserDomain';

export class UnblockUserUseCase {
  private userRepository = UserRepositoryFactory.create();
  private userDomain = new DefaultUserDomain(this.userRepository);

  async execute(username: string): Promise<void> {
    await this.userDomain.unblockUser(username);
  }
} 