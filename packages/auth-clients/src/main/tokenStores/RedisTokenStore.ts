import TokenStore from '../types/TokenStore'
import { RedisClient } from '../types/RedisClient'

export default class RedisTokenStore implements TokenStore {
  private readonly prefix = 'systemToken:'

  constructor(private readonly client: RedisClient) {}

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    await this.ensureConnected()
    await this.client.set(`${this.prefix}${key}`, token, { EX: durationSeconds })
  }

  public async getToken(key: string): Promise<string | null> {
    await this.ensureConnected()

    return this.client.get(`${this.prefix}${key}`)
  }
}
