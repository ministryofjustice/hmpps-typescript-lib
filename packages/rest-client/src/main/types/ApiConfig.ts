import type http from 'http'
import type { HttpOptions, HttpsOptions } from 'agentkeepalive'

export class AgentConfig {
  // Sets the working socket to timeout after timeout milliseconds of inactivity on the working socket.
  timeout: number

  constructor(timeout = 8000) {
    this.timeout = timeout
  }
}

export type AgentOptions = AgentConfig | HttpOptions | HttpsOptions

export interface TransportConfig {
  /**
   * Explicit agent instance to use for all requests.
   *
   * When provided, the rest client will always use this agent, even when Node env proxy mode is enabled.
   * The caller is responsible for ensuring the supplied agent is compatible with any required proxying.
   */
  agent?: http.Agent
  /**
   * Factory for creating an explicit agent instance.
   *
   * This is evaluated during client construction and overrides both the default keepalive agent and Node env proxy
   * auto-detection. The caller is responsible for ensuring the supplied agent is compatible with any required
   * proxying.
   */
  createAgent?: (options: { url: string; agentConfig: AgentOptions }) => http.Agent
}

export interface ApiConfig {
  url: string
  timeout: {
    // sets maximum time to wait for the first byte to arrive from the server, but it does not limit how long the
    // entire download can take.
    response: number
    // sets a deadline for the entire request (including all uploads, redirects, server processing time) to complete.
    // If the response isn't fully downloaded within that time, the request will be aborted.
    deadline: number
  }
  /**
   * Configuration for the default keepalive agent created by hmpps-rest-client.
   *
   * This is ignored when `transport.agent` or `transport.createAgent` is supplied, and it is also ignored when Node
   * env proxy mode is active and no explicit transport override is configured.
   */
  agent: AgentOptions
  /**
   * Explicit transport override for callers that need to supply or construct their own agent.
   *
   * `transport.agent` and `transport.createAgent` take precedence over `agent`.
   */
  transport?: TransportConfig
}
