import bcrypt from 'bcrypt';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn()
  public username: string;

  @Column()
  public passwordHash: string;

  @Column('text', { array: true })
  public roles: string[];

  @Column()
  public blocked: boolean;

  @Column('text', { array: true })
  public refreshTokens: string[];

  constructor(
    username: string,
    passwordHash: string,
    roles: string[] = [],
    blocked: boolean = false,
    refreshTokens: string[] = []
  ) {
    this.username = username;
    this.passwordHash = passwordHash;
    this.roles = roles;
    this.blocked = blocked;
    this.refreshTokens = refreshTokens;
  }

  async verifyPassword(password: string): Promise<boolean> {
    if (!password || password === null || password === undefined) {
      return false;
    }
    return bcrypt.compare(password, this.passwordHash);
  }
}