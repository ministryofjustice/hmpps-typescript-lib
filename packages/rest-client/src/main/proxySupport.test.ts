import { AgentConfig, type ApiConfig } from './types/ApiConfig'
import { getProxyEnv, usesNodeEnvProxy } from './proxySupport'

const baseApiConfig: ApiConfig = {
  url: 'http://localhost:8080/api',
  timeout: { response: 200, deadline: 200 },
  agent: new AgentConfig(200),
}

describe('usesNodeEnvProxy', () => {
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

  it('returns false when no proxy env vars are set', () => {
    expect(usesNodeEnvProxy()).toBe(false)
  })

  it.each(['1', 'true', 'TRUE', 'True'])('returns true when NODE_USE_ENV_PROXY is %s', value => {
    process.env.NODE_USE_ENV_PROXY = value
    expect(usesNodeEnvProxy()).toBe(true)
  })

  it('returns false when NODE_USE_ENV_PROXY is an unrecognised value', () => {
    process.env.NODE_USE_ENV_PROXY = 'yes'
    expect(usesNodeEnvProxy()).toBe(false)
  })

  it('returns true when NODE_OPTIONS includes --use-env-proxy', () => {
    process.env.NODE_OPTIONS = '--use-env-proxy'
    expect(usesNodeEnvProxy()).toBe(true)
  })

  it('returns true when NODE_OPTIONS includes --use-env-proxy alongside other flags', () => {
    process.env.NODE_OPTIONS = '--max-old-space-size=4096 --use-env-proxy'
    expect(usesNodeEnvProxy()).toBe(true)
  })

  it('returns false when NODE_OPTIONS does not include --use-env-proxy', () => {
    process.env.NODE_OPTIONS = '--max-old-space-size=4096'
    expect(usesNodeEnvProxy()).toBe(false)
  })

  it('returns true when process.execArgv includes --use-env-proxy', () => {
    Object.defineProperty(process, 'execArgv', { value: ['--use-env-proxy'], configurable: true })
    expect(usesNodeEnvProxy()).toBe(true)
  })

  it('returns false when process.execArgv does not include --use-env-proxy', () => {
    Object.defineProperty(process, 'execArgv', { value: ['--max-old-space-size=4096'], configurable: true })
    expect(usesNodeEnvProxy()).toBe(false)
  })
})

describe('getProxyEnv', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NODE_USE_ENV_PROXY
    delete process.env.NODE_OPTIONS
    delete process.env.HTTP_PROXY
    delete process.env.http_proxy
    delete process.env.HTTPS_PROXY
    delete process.env.https_proxy
    delete process.env.NO_PROXY
    delete process.env.no_proxy
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('when usesNodeEnvProxy() is true', () => {
    beforeEach(() => {
      process.env.NODE_USE_ENV_PROXY = 'true'
    })

    it('returns proxy vars from uppercase env vars', () => {
      process.env.HTTP_PROXY = 'http://proxy:3128'
      process.env.HTTPS_PROXY = 'https://proxy:3128'
      process.env.NO_PROXY = 'localhost'

      expect(getProxyEnv(baseApiConfig)).toEqual({
        http_proxy: 'http://proxy:3128',
        https_proxy: 'https://proxy:3128',
        no_proxy: 'localhost',
      })
    })

    it('falls back to lowercase env vars when uppercase are not set', () => {
      process.env.http_proxy = 'http://proxy:3128'
      process.env.https_proxy = 'https://proxy:3128'
      process.env.no_proxy = 'localhost'

      expect(getProxyEnv(baseApiConfig)).toEqual({
        http_proxy: 'http://proxy:3128',
        https_proxy: 'https://proxy:3128',
        no_proxy: 'localhost',
      })
    })

    it('prefers uppercase over lowercase env vars', () => {
      process.env.HTTP_PROXY = 'http://upper:3128'
      process.env.http_proxy = 'http://lower:3128'

      expect(getProxyEnv(baseApiConfig)).toMatchObject({ http_proxy: 'http://upper:3128' })
    })

    it('returns undefined values when no proxy env vars are set', () => {
      expect(getProxyEnv(baseApiConfig)).toEqual({
        http_proxy: undefined,
        https_proxy: undefined,
        no_proxy: undefined,
      })
    })
  })

  describe('when usesNodeEnvProxy() is false', () => {
    it('returns proxyEnv from agent config when present', () => {
      const proxyEnv = { http_proxy: 'http://proxy:3128', https_proxy: undefined, no_proxy: undefined }
      const config: ApiConfig = {
        ...baseApiConfig,
        agent: { timeout: 200, proxyEnv } as AgentConfig & { proxyEnv: typeof proxyEnv },
      }

      expect(getProxyEnv(config)).toEqual(proxyEnv)
    })

    it('returns undefined when agent config has no proxyEnv', () => {
      expect(getProxyEnv(baseApiConfig)).toBeUndefined()
    })
  })
})
