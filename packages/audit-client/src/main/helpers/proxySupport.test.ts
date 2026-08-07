import { NodeHttpHandler } from '@smithy/node-http-handler'

import { createProxyRequestHandler, isProxyEnabled } from './proxySupport'

describe('isProxyEnabled', () => {
  const originalEnv = process.env
  const originalExecArgv = process.execArgv

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NODE_USE_ENV_PROXY
    delete process.env.NODE_OPTIONS
    Object.defineProperty(process, 'execArgv', { value: [], configurable: true })
  })

  afterEach(() => {
    process.env = originalEnv
    Object.defineProperty(process, 'execArgv', { value: originalExecArgv, configurable: true })
  })

  it('returns false when proxy flags are not set', () => {
    expect(isProxyEnabled()).toBe(false)
  })

  it.each(['1', 'true', 'TRUE', 'True'])('returns true when NODE_USE_ENV_PROXY is %s', value => {
    process.env.NODE_USE_ENV_PROXY = value
    expect(isProxyEnabled()).toBe(true)
  })

  it('returns false when NODE_USE_ENV_PROXY has an unrecognised value', () => {
    process.env.NODE_USE_ENV_PROXY = 'yes'
    expect(isProxyEnabled()).toBe(false)
  })

  it('returns true when NODE_OPTIONS includes --use-env-proxy', () => {
    process.env.NODE_OPTIONS = '--max-old-space-size=4096 --use-env-proxy'
    expect(isProxyEnabled()).toBe(true)
  })

  it('returns true when process.execArgv includes --use-env-proxy', () => {
    Object.defineProperty(process, 'execArgv', { value: ['--use-env-proxy'], configurable: true })
    expect(isProxyEnabled()).toBe(true)
  })
})

describe('createProxyRequestHandler', () => {
  const originalEnv = process.env
  const originalExecArgv = process.execArgv
  const targetUrl = 'https://sqs.eu-west-2.amazonaws.com'

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NODE_USE_ENV_PROXY
    delete process.env.NODE_OPTIONS
    delete process.env.HTTPS_PROXY
    delete process.env.https_proxy
    delete process.env.HTTP_PROXY
    delete process.env.http_proxy
    delete process.env.NO_PROXY
    delete process.env.no_proxy
    Object.defineProperty(process, 'execArgv', { value: [], configurable: true })
  })

  afterEach(() => {
    process.env = originalEnv
    Object.defineProperty(process, 'execArgv', { value: originalExecArgv, configurable: true })
  })

  it('returns an empty object when proxy is disabled', () => {
    expect(createProxyRequestHandler(targetUrl)).toEqual({})
  })

  it('returns an empty object when proxy is enabled but no proxy URL is configured', () => {
    process.env.NODE_USE_ENV_PROXY = 'true'
    expect(createProxyRequestHandler(targetUrl)).toEqual({})
  })

  it('returns a NodeHttpHandler when proxy is enabled and proxy URL is configured', () => {
    process.env.NODE_USE_ENV_PROXY = 'true'
    process.env.HTTPS_PROXY = 'http://proxy.internal:3128'

    const result = createProxyRequestHandler(targetUrl)

    expect(result.requestHandler).toBeInstanceOf(NodeHttpHandler)
  })

  it('returns a NodeHttpHandler when enabled via --use-env-proxy and proxy URL is configured', () => {
    process.env.NODE_OPTIONS = '--use-env-proxy'
    process.env.HTTPS_PROXY = 'http://proxy.internal:3128'

    const result = createProxyRequestHandler(targetUrl)

    expect(result.requestHandler).toBeInstanceOf(NodeHttpHandler)
  })

  it('does not proxy a target URL matched by NO_PROXY', () => {
    process.env.NODE_USE_ENV_PROXY = 'true'
    process.env.HTTPS_PROXY = 'http://proxy.internal:3128'
    process.env.NO_PROXY = '.amazonaws.com'

    const result = createProxyRequestHandler(targetUrl)

    expect(result).toEqual({})
  })

  it('still proxies a target URL not matched by NO_PROXY', () => {
    process.env.NODE_USE_ENV_PROXY = 'true'
    process.env.HTTPS_PROXY = 'http://proxy.internal:3128'
    process.env.NO_PROXY = 'other.example.com'

    const result = createProxyRequestHandler(targetUrl)

    expect(result.requestHandler).toBeInstanceOf(NodeHttpHandler)
  })

  it('does not proxy anything when NO_PROXY is "*"', () => {
    process.env.NODE_USE_ENV_PROXY = 'true'
    process.env.HTTPS_PROXY = 'http://proxy.internal:3128'
    process.env.NO_PROXY = '*'

    const result = createProxyRequestHandler(targetUrl)

    expect(result).toEqual({})
  })
})
