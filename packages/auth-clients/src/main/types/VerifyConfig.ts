import { ApiConfig } from '@ministryofjustice/hmpps-rest-client/dist/main'

export default interface VerifyConfig extends ApiConfig {
  enabled: boolean
}
