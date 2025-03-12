import type Logger from 'bunyan'
import { RestClient, asUser } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticatedRequest } from './types/AuthenticatedRequest'
import VerifyConfig from './types/VerifyConfig'

export default class VerificationClient extends RestClient {
  constructor(
    protected readonly config: VerifyConfig,
    protected readonly logger: Logger | Console,
  ) {
    super('HMPPS Token Verification API', config, logger)
  }

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      this.logger.debug(`Token verification failed for user "${user.username}"`)
      return false
    }
  }
}
