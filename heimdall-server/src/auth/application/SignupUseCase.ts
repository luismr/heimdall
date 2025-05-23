import { UserRepository } from '../infrastructure/UserRepository';
import { UserDomain } from '../domain/UserDomain';
import { User } from '../domain/User';

export class SignupUseCase {
  private userRepository = new UserRepository();
  private userDomain = new UserDomain(this.userRepository);

  async execute(username: string, password: string): Promise<User> {
    return this.userDomain.signup(username, password);
  }
} 