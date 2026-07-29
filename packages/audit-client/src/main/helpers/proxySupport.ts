import { NodeHttpHandler } from '@smithy/node-http-handler'
import { HttpsProxyAgent } from 'https-proxy-agent'

/**
 * Determines if proxy support should be enabled based on Node proxy configuration.
 *
 * Returns true when any of the following are set:
 * - NODE_USE_ENV_PROXY is '1' or 'true' (case-insensitive)
 * - NODE_OPTIONS contains '--use-env-proxy'
 * - process.execArgv includes '--use-env-proxy'
 *
 * @returns true if proxy support should be enabled, false otherwise
 */
export function isProxyEnabled(): boolean {
  const nodeUseEnvProxy = process.env.NODE_USE_ENV_PROXY?.toLowerCase()
  return (
    nodeUseEnvProxy === '1' ||
    nodeUseEnvProxy === 'true' ||
    process.env.NODE_OPTIONS?.includes('--use-env-proxy') ||
    process.execArgv.includes('--use-env-proxy')
  )
}

/**
 * Reads proxy configuration from environment variables.
 *
 * Checks for HTTPS_PROXY and HTTP_PROXY environment variables (case-insensitive).
 *
 * @returns the proxy URL if found, undefined otherwise
 */
export function getProxyUrl(): string | undefined {
  return process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy
}

/**
 * Creates an SQS client request handler with proxy support if configured.
 *
 * When proxy support is enabled and a proxy is configured via environment variables,
 * returns a NodeHttpHandler configured with an HttpsProxyAgent. Otherwise returns undefined
 * to allow SQSClient to use its default handler.
 *
 * @returns a NodeHttpHandler with proxy configuration, or undefined if proxy is not configured
 *
 * @example
 * ```typescript
 * const sqsClient = new SQSClient({
 *   region: 'eu-west-2',
 *   ...createProxyRequestHandler(),
 * });
 * ```
 */
export function createProxyRequestHandler(): { requestHandler?: NodeHttpHandler } {
  if (!isProxyEnabled()) {
    return {}
  }

  const proxyUrl = getProxyUrl()
  if (!proxyUrl) {
    return {}
  }

  const agent = new HttpsProxyAgent(proxyUrl)
  return {
    requestHandler: new NodeHttpHandler({
      httpsAgent: agent,
    }),
  }
}
