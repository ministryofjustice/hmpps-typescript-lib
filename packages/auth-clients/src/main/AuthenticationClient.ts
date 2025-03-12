import { URLSearchParams } from 'url'
import type Logger from 'bunyan'
import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import TokenStore from './types/TokenStore'
import AuthConfig from './types/AuthConfig'
import InMemoryTokenStore from './tokenStores/InMemoryTokenStore'

/**
 * A client for authenticating with the HMPPS Auth API, retrieving tokens for system usage or impersonation.
 * @class
 * @extends RestClient
 *
 * @example
 * import AuthenticationClient from './AuthenticationClient'
 *
 * const authClient = new AuthenticationClient(
 *   {
 *     systemClientId: 'client-id',
 *     systemClientSecret: 'client-secret',
 *     ...ApiConfig
 *   },
 *   console
 * )
 *
 * const token = await authClient.getToken('some-user')
 */
export default class AuthenticationClient extends RestClient {
  /**
   * Creates an instance of AuthenticationClient.
   * @param {AuthConfig} config - The AuthConfig settings for the client.
   * @param {Logger|Console} logger - The logging mechanism.
   * @param {TokenStore} [tokenStore=new InMemoryTokenStore()] - Optional token store to cache tokens.
   */
  constructor(
    protected readonly config: AuthConfig,
    protected readonly logger: Logger | Console,
    private readonly tokenStore: TokenStore = new InMemoryTokenStore(),
  ) {
    super('HMPPS Auth API', config, logger)
  }

  /**
   * Retrieves a token from the token store or fetches a new one from the HMPPS Auth API.
   * @param {string} [username] - An optional username to impersonate; if omitted, a system (anonymous) token is fetched.
   * @returns {Promise<string>} - A promise that resolves with the retrieved or newly fetched token.
   */
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
