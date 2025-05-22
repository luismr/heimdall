import { User } from '../domain/User';
import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE || 'HeimdallUsers';

export class UserRepository {
  async findByUsername(username: string): Promise<User | null> {
    const result = await dynamoDb.get({
      TableName: USERS_TABLE,
      Key: { username }
    }).promise();
    if (!result.Item) return null;
    return new User(
      result.Item.username,
      result.Item.passwordHash,
      result.Item.roles,
      result.Item.blocked,
      result.Item.refreshTokens || []
    );
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    const result = await dynamoDb.scan({
      TableName: USERS_TABLE,
      FilterExpression: 'contains(refreshTokens, :token)',
      ExpressionAttributeValues: { ':token': refreshToken }
    }).promise();
    if (!result.Items || result.Items.length === 0) return null;
    const item = result.Items[0];
    return new User(
      item.username,
      item.passwordHash,
      item.roles,
      item.blocked,
      item.refreshTokens || []
    );
  }

  async save(user: User): Promise<void> {
    await dynamoDb.put({
      TableName: USERS_TABLE,
      Item: user
    }).promise();
  }

  async saveRefreshToken(username: string, refreshToken: string): Promise<void> {
    const user = await this.findByUsername(username);
    if (!user) throw new Error('User not found');
    user.refreshTokens.push(refreshToken);
    await this.save(user);
  }

  async removeRefreshToken(refreshToken: string): Promise<void> {
    const user = await this.findByRefreshToken(refreshToken);
    if (!user) return;
    user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken);
    await this.save(user);
  }

  async updateBlocked(username: string, blocked: boolean): Promise<void> {
    const user = await this.findByUsername(username);
    if (!user) throw new Error('User not found');
    user.blocked = blocked;
    await this.save(user);
  }

  async remove(username: string): Promise<void> {
    await dynamoDb.delete({
      TableName: USERS_TABLE,
      Key: { username }
    }).promise();
  }
}