import { ApiConfig } from '@ministryofjustice/hmpps-rest-client'

export default interface AuthConfig extends ApiConfig {
  systemClientId: string
  systemClientSecret: string
}
