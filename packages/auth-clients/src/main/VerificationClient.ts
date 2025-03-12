import type Logger from 'bunyan'
import { RestClient, asUser } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticatedRequest } from './types/AuthenticatedRequest'
import VerifyConfig from './types/VerifyConfig'

/**
 * A client for verifying tokens using the HMPPS Token Verification API.
 * @class
 * @extends RestClient
 *
 * @example
 * import VerificationClient from './VerificationClient'
 *
 * const verifyClient = new VerificationClient(
 *   {
 *     enabled: true,
 *     ...ApiConfig
 *   },
 *   console
 * )
 *
 * const isValid = await verifyClient.verifyToken({ user: { username: 'some-user', token: 'abc123' } })
 */
export default class VerificationClient extends RestClient {
  /**
   * Creates an instance of VerificationClient.
   * @param {VerifyConfig} config - The VerifyConfig settings for the token verification client.
   * @param {Logger|Console} logger - The logging mechanism.
   */
  constructor(
    protected readonly config: VerifyConfig,
    protected readonly logger: Logger | Console,
  ) {
    super('HMPPS Token Verification API', config, logger)
  }

  /**
   * Verifies a token for a given AuthenticatedRequest.
   * @param {AuthenticatedRequest} request - The request object containing user credentials and verification status.
   * @returns {Promise<boolean>} - A promise that resolves to true if valid or if verification is disabled; otherwise false.
   */
  async verifyToken(request: AuthenticatedRequest): Promise<boolean> {
    const { user, verified } = request

    if (!this.config.enabled) {
      this.logger.debug('Token verification disabled, returning token is valid')
      return true
    }

    if (verified) {
      return true
    }

    this.logger.debug(`Token request for user "${user.username}"`)

    try {
      const response = (await this.post({ path: `/token/verify` }, asUser(user.token))) as { active: boolean }
      if (response && response.active) {
        request.verified = true
        return true
      }

      return false
    } catch (error) {
      this.logger.warn(`Token verification failed for user "${user.username}", ${error}`)
      return false
    }
  }
}
