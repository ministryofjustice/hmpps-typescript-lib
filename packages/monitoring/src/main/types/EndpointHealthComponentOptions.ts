import type { AgentConfig, TransportConfig } from '@ministryofjustice/hmpps-rest-client'
import type http from 'http'

export interface EndpointHealthTransportOptions extends Omit<TransportConfig, 'createAgent'> {
  /**
   * Explicit agent instance to use for health checks.
   *
   * When provided, the monitoring package will always use this agent, even when Node env proxy mode is enabled.
   * The caller is responsible for ensuring the supplied agent is compatible with any required proxying.
   */
  agent?: http.Agent
  /**
   * Factory for creating an explicit health-check agent.
   *
   * This overrides both the default keepalive agent and Node env proxy auto-detection. The caller is responsible for
   * ensuring the supplied agent is compatible with any required proxying.
   */
  createAgent?: (options: { url: string; healthPath: string; agentConfig?: AgentConfig }) => http.Agent
}

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
  /** (Optional) Agent configuration from hmpps-rest-client ApiConfig. */
  agent?: AgentConfig
  /** (Optional) Agent configuration options for HTTP/HTTPS requests to the service. */
  agentConfig?: AgentConfig
  /** (Optional) Explicit transport override for health checks. */
  transport?: EndpointHealthTransportOptions
}
