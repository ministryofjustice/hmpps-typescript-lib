import type { AgentOptions } from '@ministryofjustice/hmpps-rest-client'

export interface EndpointHealthComponentOptions {
  /** The root URL of the external service to be health-checked. */
  url: string
  /** The path that represents the endpoint that will be called on the external service to be health-checked. The full endpoint url that will be called is `${url}${healthPath}`. */
  healthPath: string
  /** (Optional) Indicates whether the component is enabled for health checks, defaults to true */
  enabled?: boolean
  /** The timeout settings for the component's health check, matches SARequest.timeout from superagent */
  timeout?:
    | number
    | {
        response?: number
        deadline?: number
      }
  /** (Optional) The number of retry attempts for the component's health check. Defaults to 2 */
  retries?: number
  /**
   * (Optional) Preferred agent configuration options for HTTP/HTTPS requests to the service.
   *
   * When both `agent` and `agentConfig` are supplied, `agent` takes precedence.
   */
  agent?: AgentOptions
  /**
   * (Optional) Legacy alias for `agent`.
   *
   * This is retained for backwards compatibility. When both `agent` and `agentConfig` are supplied, `agent` takes
   * precedence.
   */
  agentConfig?: AgentOptions
}
