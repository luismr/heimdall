import { User } from '../domain/User';
import { DefaultUserDomain } from '../domain/DefaultUserDomain';
import { UserRepositoryFactory } from '../infrastructure/UserRepositoryFactory';

export class SignupUseCase {
  private userDomain: DefaultUserDomain;

  constructor() {
    const userRepository = UserRepositoryFactory.create();
    this.userDomain = new DefaultUserDomain(userRepository);
  }

  async execute(username: string, password: string): Promise<User> {
    return this.userDomain.signup(username, password);
  }
} 