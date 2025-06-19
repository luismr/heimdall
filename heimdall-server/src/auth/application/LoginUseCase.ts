import { UserRepositoryFactory } from '../infrastructure/UserRepositoryFactory';
import { DefaultUserDomain } from '../domain/DefaultUserDomain';
import { User } from '../domain/User';

export class LoginUseCase {
  private userRepository = UserRepositoryFactory.create();
  private userDomain = new DefaultUserDomain(this.userRepository);

  async execute(username: string, password: string): Promise<{ user: User, accessToken: string, refreshToken: string }> {
    return this.userDomain.login(username, password);
  }
} 