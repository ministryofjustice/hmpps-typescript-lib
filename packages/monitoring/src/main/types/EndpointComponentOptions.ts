import type { HttpOptions, HttpsOptions } from 'agentkeepalive'

export default interface EndpointComponentOptions {
  /** The name of the component. */
  name: string
  /** The URL endpoint of the external service to be health-checked. */
  url: string
  /** (Optional) Indicates whether the component is enabled for health checks, defaults to true */
  enabled?: boolean
  /** The timeout settings for the component's health check, matches SARequest.timeout from superagent */
  timeout?:
    | number
    | {
        response?: number
        deadline?: number
      }
  /** (Optional) The number of retry attempts for the health check. Defaults to 2 */
  retries?: number
  /** (Optional) Agent configuration options for HTTP/HTTPS requests to the service. */
  agentConfig?: HttpsOptions | HttpOptions
}
