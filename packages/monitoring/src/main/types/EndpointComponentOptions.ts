import type { HttpOptions, HttpsOptions } from 'agentkeepalive'

export interface EndpointComponentOptions {
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
  /** (Optional) The number of retry attempts for the health check. Defaults to 2 */
  retries?: number
  /** (Optional) Agent configuration options for HTTP/HTTPS requests to the service. */
  agentConfig?: HttpsOptions | HttpOptions
}
