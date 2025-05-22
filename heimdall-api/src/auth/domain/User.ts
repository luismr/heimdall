import bcrypt from 'bcrypt';

export class User {
  constructor(
    public username: string,
    public passwordHash: string,
    public roles: string[],
    public blocked: boolean = false,
    public refreshTokens: string[] = []
  ) {}

  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }
}