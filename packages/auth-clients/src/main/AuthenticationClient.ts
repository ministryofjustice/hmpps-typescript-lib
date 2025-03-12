import { URLSearchParams } from 'url'
import type Logger from 'bunyan'
import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import TokenStore from './types/TokenStore'
import AuthConfig from './types/AuthConfig'
import InMemoryTokenStore from './tokenStores/InMemoryTokenStore'

export default class AuthenticationClient extends RestClient {
  constructor(
    protected readonly config: AuthConfig,
    protected readonly logger: Logger | Console,
    private readonly tokenStore: TokenStore = new InMemoryTokenStore(),
  ) {
    super('HMPPS Auth API', config, logger)
  }

  async getToken(username?: string): Promise<string> {
    const key = username || '%ANONYMOUS%'
    const existingToken = await this.tokenStore.getToken(key)

    if (existingToken) {
      return existingToken
    }

    const clientToken = Buffer.from(`${this.config.systemClientId}:${this.config.systemClientSecret}`).toString(
      'base64',
    )

    const grantRequest = new URLSearchParams({
      grant_type: 'client_credentials',
      ...(username && { username }),
    }).toString()

    this.logger.info(`${grantRequest} HMPPS Auth request for client id '${this.config.systemClientId}'`)

    const response = await this.post<{ access_token: string; expires_in: number }>({
      path: '/oauth/token',
      headers: {
        Authorization: `Basic ${clientToken}`,
      },
      data: grantRequest,
    })

    const newToken = response.access_token
    const expiresIn = response.expires_in - 60

    await this.tokenStore.setToken(key, newToken, expiresIn)

    return newToken
  }
}
