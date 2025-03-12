import TokenStore from '../types/TokenStore'
import { RedisClient } from '../types/RedisClient'

/**
 * A token store implementation using Redis as the backend.
 * @class
 * @implements {TokenStore}
 *
 * @example
 * import RedisTokenStore from './tokenStores/RedisTokenStore'
 * import { createClient } from 'redis'
 *
 * const redisClient = createClient() // Use the redis library
 * const tokenStore = new RedisTokenStore(redisClient)
 * await tokenStore.setToken('some-key', 'abc123', 3600)
 * const token = await tokenStore.getToken('some-key')
 */
export default class RedisTokenStore implements TokenStore {
  private readonly prefix = 'systemToken:'

  /**
   * Creates an instance of RedisTokenStore.
   * @param {RedisClient} client - A Redis client instance.
   */
  constructor(private readonly client: RedisClient) {}

  /**
   * Ensures the Redis client is connected.
   * @private
   * @returns {Promise<void>}
   */
  private async ensureConnected(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  /**
   * Stores a token in Redis with a specified expiration.
   * @param {string} key - The key under which to store the token.
   * @param {string} token - The token string.
   * @param {number} durationSeconds - The number of seconds the token remains valid.
   * @returns {Promise<void>}
   */
  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    await this.ensureConnected()
    await this.client.set(`${this.prefix}${key}`, token, { EX: durationSeconds })
  }

  /**
   * Retrieves a token from Redis by key.
   * @param {string} key - The key associated with the token.
   * @returns {Promise<string | null>} - A promise that resolves with the token or null if not found or expired.
   */
  public async getToken(key: string): Promise<string | null> {
    await this.ensureConnected()

    return this.client.get(`${this.prefix}${key}`)
  }
}
