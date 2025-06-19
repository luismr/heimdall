import { UserRepositoryFactory } from '../infrastructure/UserRepositoryFactory';
import { DefaultUserDomain } from '../domain/DefaultUserDomain';

export class LogoutUseCase {
  private userRepository = UserRepositoryFactory.create();
  private userDomain = new DefaultUserDomain(this.userRepository);

  async execute(refreshToken: string): Promise<void> {
    await this.userDomain.logout(refreshToken);
  }
} 