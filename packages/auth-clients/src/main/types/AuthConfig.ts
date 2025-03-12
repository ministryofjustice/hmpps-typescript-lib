import { ApiConfig } from '@ministryofjustice/hmpps-rest-client/dist/main'

export default interface AuthConfig extends ApiConfig {
  systemClientId: string
  systemClientSecret: string
}
