import TokenStore from '../types/TokenStore'

/**
 * An in-memory token store implementation for development or testing.
 * @class
 * @implements {TokenStore}
 *
 * @example
 * import InMemoryTokenStore from './tokenStores/InMemoryTokenStore'
 *
 * const tokenStore = new InMemoryTokenStore()
 * await tokenStore.setToken('some-key', 'abc123', 3600)
 * const token = await tokenStore.getToken('some-key')
 */
export default class InMemoryTokenStore implements TokenStore {
  private readonly map = new Map<string, { token: string; expiry: Date }>()

  /**
   * Stores a token in memory with a specified expiration.
   * @param {string} key - The key under which to store the token.
   * @param {string} token - The token string.
   * @param {number} durationSeconds - The number of seconds the token remains valid.
   * @returns {Promise<void>}
   */
  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    this.map.set(key, { token, expiry: new Date(Date.now() + durationSeconds * 1000) })
    return Promise.resolve()
  }

  /**
   * Retrieves a token from memory by key.
   * @param {string} key - The key associated with the token.
   * @returns {Promise<string | null>} - A promise that resolves with the token or null if not found or expired.
   */
  public async getToken(key: string): Promise<string | null> {
    if (!this.map.has(key) || this.map.get(key)!.expiry.getTime() < Date.now()) {
      return Promise.resolve(null)
    }

    return Promise.resolve(this.map.get(key)!.token)
  }
}
