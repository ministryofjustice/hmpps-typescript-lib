import { NodeHttpHandler } from '@smithy/node-http-handler'

import { createProxyRequestHandler, getProxyUrl, isProxyEnabled } from './proxySupport'

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

describe('getProxyUrl', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.HTTPS_PROXY
    delete process.env.https_proxy
    delete process.env.HTTP_PROXY
    delete process.env.http_proxy
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns undefined when no proxy environment variable is set', () => {
    expect(getProxyUrl()).toBeUndefined()
  })

  it('returns HTTPS_PROXY when set', () => {
    process.env.HTTPS_PROXY = 'http://uppercase-https-proxy:3128'
    expect(getProxyUrl()).toEqual('http://uppercase-https-proxy:3128')
  })

  it('falls back to lowercase HTTPS proxy', () => {
    process.env.https_proxy = 'http://lowercase-https-proxy:3128'
    expect(getProxyUrl()).toEqual('http://lowercase-https-proxy:3128')
  })

  it('falls back to HTTP proxy values when HTTPS proxy vars are absent', () => {
    process.env.HTTP_PROXY = 'http://uppercase-http-proxy:3128'
    expect(getProxyUrl()).toEqual('http://uppercase-http-proxy:3128')

    delete process.env.HTTP_PROXY
    process.env.http_proxy = 'http://lowercase-http-proxy:3128'
    expect(getProxyUrl()).toEqual('http://lowercase-http-proxy:3128')
  })
})

describe('createProxyRequestHandler', () => {
  const originalEnv = process.env
  const originalExecArgv = process.execArgv

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NODE_USE_ENV_PROXY
    delete process.env.NODE_OPTIONS
    delete process.env.HTTPS_PROXY
    delete process.env.https_proxy
    delete process.env.HTTP_PROXY
    delete process.env.http_proxy
    Object.defineProperty(process, 'execArgv', { value: [], configurable: true })
  })

  afterEach(() => {
    process.env = originalEnv
    Object.defineProperty(process, 'execArgv', { value: originalExecArgv, configurable: true })
  })

  it('returns an empty object when proxy is disabled', () => {
    expect(createProxyRequestHandler()).toEqual({})
  })

  it('returns an empty object when proxy is enabled but no proxy URL is configured', () => {
    process.env.NODE_USE_ENV_PROXY = 'true'
    expect(createProxyRequestHandler()).toEqual({})
  })

  it('returns a NodeHttpHandler when proxy is enabled and proxy URL is configured', () => {
    process.env.NODE_USE_ENV_PROXY = 'true'
    process.env.HTTPS_PROXY = 'http://proxy.internal:3128'

    const result = createProxyRequestHandler()

    expect(result.requestHandler).toBeInstanceOf(NodeHttpHandler)
  })

  it('returns a NodeHttpHandler when enabled via --use-env-proxy and proxy URL is configured', () => {
    process.env.NODE_OPTIONS = '--use-env-proxy'
    process.env.HTTP_PROXY = 'http://proxy.internal:3128'

    const result = createProxyRequestHandler()

    expect(result.requestHandler).toBeInstanceOf(NodeHttpHandler)
  })
})
