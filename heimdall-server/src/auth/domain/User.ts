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
    if (!password || password === null || password === undefined) {
      return false;
    }
    return bcrypt.compare(password, this.passwordHash);
  }
}