import TokenStore from '../types/TokenStore'

export default class InMemoryTokenStore implements TokenStore {
  private readonly map = new Map<string, { token: string; expiry: Date }>()

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    this.map.set(key, { token, expiry: new Date(Date.now() + durationSeconds * 1000) })
    return Promise.resolve()
  }

  public async getToken(key: string): Promise<string | null> {
    if (!this.map.has(key) || this.map.get(key)!.expiry.getTime() < Date.now()) {
      return Promise.resolve(null)
    }

    return Promise.resolve(this.map.get(key)!.token)
  }
}
