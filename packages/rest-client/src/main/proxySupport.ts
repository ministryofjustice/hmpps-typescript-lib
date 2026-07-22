import http from 'http'
import { ApiConfig, AgentOptions } from './types/ApiConfig'

export const usesNodeEnvProxy = () => {
  const nodeUseEnvProxy = process.env.NODE_USE_ENV_PROXY?.toLowerCase()

  return (
    nodeUseEnvProxy === '1' ||
    nodeUseEnvProxy === 'true' ||
    process.env.NODE_OPTIONS?.includes('--use-env-proxy') ||
    process.execArgv.includes('--use-env-proxy')
  )
}

/**
 * Read proxy info from environment if present, else fall back to agent config, else don't support proxies.
 *
 * @param config - The api config for this client
 * @returns Proxy environment variables if configured, otherwise undefined.
 */
export const getProxyEnv = (config: ApiConfig): http.ProxyEnv | undefined => {
  if (usesNodeEnvProxy())
    return {
      http_proxy: process.env.HTTP_PROXY || process.env.http_proxy,
      https_proxy: process.env.HTTPS_PROXY || process.env.https_proxy,
      no_proxy: process.env.NO_PROXY || process.env.no_proxy,
    }

  const agentOptions = config.agent || ({} as AgentOptions)
  if ('proxyEnv' in agentOptions) {
    return agentOptions.proxyEnv
  }
  return undefined
}
