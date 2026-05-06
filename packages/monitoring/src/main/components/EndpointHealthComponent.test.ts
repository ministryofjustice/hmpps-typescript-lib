import http from 'http'
import { createTestNock } from '../../test/utils'
import EndpointHealthComponent from './EndpointHealthComponent'
import type { EndpointHealthComponentOptions } from '../types/EndpointHealthComponentOptions'

describe('EndpointHealthComponent', () => {
  let nock: ReturnType<typeof createTestNock>
  const componentName = 'test-component'
  let endpointHealthComponentOptions: EndpointHealthComponentOptions
  const originalNodeUseEnvProxy = process.env.NODE_USE_ENV_PROXY
  const originalNodeOptions = process.env.NODE_OPTIONS
  const [, major = '0'] = process.version.match(/^v(\d+)\.(\d+)\.(\d+)/) ?? []
  const nodeSupportsEnvProxy = Number(major) >= 24

  const restoreEnvVar = (name: 'NODE_USE_ENV_PROXY' | 'NODE_OPTIONS', value: string | undefined) => {
    if (value === undefined) {
      delete process.env[name]
    } else {
      process.env[name] = value
    }
  }

  const messages = jest.fn()
  const logger = {
    info: messages,
    warn: messages,
  } as unknown as jest.Mocked<Console>

  const getInternalAgent = (component: EndpointHealthComponent) =>
    (component as unknown as { healthClient: { agent?: unknown } }).healthClient.agent

  beforeEach(() => {
    nock = createTestNock({ method: 'get', baseUrl: 'https://test.local', path: '/some-path' })
    endpointHealthComponentOptions = {
      enabled: true,
      retries: 2,
      timeout: 1000,
      url: nock.baseUrl,
      healthPath: nock.uniquePath,
    }
    jest.resetAllMocks()
  })

  afterEach(() => {
    restoreEnvVar('NODE_USE_ENV_PROXY', originalNodeUseEnvProxy)
    restoreEnvVar('NODE_OPTIONS', originalNodeOptions)
    nock.done()
  })

  it('only defers to Node env proxy mode when the runtime supports it', () => {
    process.env.NODE_USE_ENV_PROXY = '1'

    const endpointHealthComponent = new EndpointHealthComponent(logger, componentName, endpointHealthComponentOptions)

    if (nodeSupportsEnvProxy) {
      expect(getInternalAgent(endpointHealthComponent)).toBeUndefined()
    } else {
      expect(getInternalAgent(endpointHealthComponent)).toBeDefined()
    }
  })

  it('uses an explicitly supplied custom agent when Node env proxy mode is enabled', () => {
    process.env.NODE_USE_ENV_PROXY = '1'

    const customAgent = new http.Agent({ keepAlive: true, timeout: 6543 })
    endpointHealthComponentOptions.transport = { agent: customAgent }

    const endpointHealthComponent = new EndpointHealthComponent(logger, componentName, endpointHealthComponentOptions)

    expect(getInternalAgent(endpointHealthComponent)).toBe(customAgent)
  })

  it('uses a custom agent created by transport.createAgent when Node env proxy mode is enabled', () => {
    process.env.NODE_USE_ENV_PROXY = '1'

    const customAgent = new http.Agent({ keepAlive: true, timeout: 7654 })
    const createAgent = jest.fn().mockReturnValue(customAgent)
    endpointHealthComponentOptions.transport = { createAgent }

    const endpointHealthComponent = new EndpointHealthComponent(logger, componentName, endpointHealthComponentOptions)

    expect(createAgent).toHaveBeenCalledWith({
      url: nock.baseUrl,
      healthPath: nock.uniquePath,
      agentConfig: expect.objectContaining({ timeout: 8000 }),
    })
    expect(getInternalAgent(endpointHealthComponent)).toBe(customAgent)
  })

  it('preserves legacy agentConfig options when creating a custom transport agent', () => {
    const customAgent = new http.Agent({ keepAlive: true, timeout: 7654 })
    const createAgent = jest.fn().mockReturnValue(customAgent)

    endpointHealthComponentOptions.agentConfig = { timeout: 4321, maxSockets: 7 }
    endpointHealthComponentOptions.transport = { createAgent }

    const endpointHealthComponent = new EndpointHealthComponent(logger, componentName, endpointHealthComponentOptions)

    expect(createAgent).toHaveBeenCalledWith({
      url: nock.baseUrl,
      healthPath: nock.uniquePath,
      agentConfig: expect.objectContaining({ timeout: 4321, maxSockets: 7 }),
    })
    expect(getInternalAgent(endpointHealthComponent)).toBe(customAgent)
  })

  it('accepts agent options under the agent field', () => {
    endpointHealthComponentOptions.agent = { timeout: 4321, maxSockets: 7 }

    const endpointHealthComponent = new EndpointHealthComponent(logger, componentName, endpointHealthComponentOptions)

    expect(
      (getInternalAgent(endpointHealthComponent) as { options: { timeout?: number; maxSockets?: number } }).options,
    ).toMatchObject({
      timeout: 4321,
      maxSockets: 7,
    })
  })

  it.each([[200], [201], [204]])(
    'should return UP status if the external service responds successfully (%s)',
    async (status: number) => {
      nock.scope.reply(status)
      const endpointHealthComponent = new EndpointHealthComponent(logger, componentName, endpointHealthComponentOptions)

      const result = await endpointHealthComponent.health()

      const expectedResult = {
        name: componentName,
        status: 'UP',
      }

      expect(result).toEqual(expectedResult)
    },
  )

  it('should return DOWN status if the external service fails all retries', async () => {
    let connectionAttempts = 0
    nock.scope.reply(500, () => {
      connectionAttempts += 1
    })

    const endpointHealthComponent = new EndpointHealthComponent(logger, componentName, endpointHealthComponentOptions)
    const result = await endpointHealthComponent.health()

    const expectedConnectionAttempts = 1 + Number(endpointHealthComponentOptions.retries)
    const expectedResult = {
      name: componentName,
      status: 'DOWN',
      details: {
        message: 'Internal Server Error',
        status: 500,
        attempts: Number(endpointHealthComponentOptions.retries) + 1,
      },
    }

    expect(connectionAttempts).toEqual(expectedConnectionAttempts)
    expect(result).toEqual(expectedResult)
  })

  it('should log retries / failure if the external service', async () => {
    nock.scope.reply(500)

    const endpointHealthComponent = new EndpointHealthComponent(logger, componentName, endpointHealthComponentOptions)
    await endpointHealthComponent.health()

    const logMessages = messages.mock.calls.map(call => call[0])

    expect(logMessages).toStrictEqual([
      `Monitoring health of external service '${componentName}' on: '${nock.fullUrl}'`,
      `Attempting to get health of external service '${componentName}', received response: 500`,
      `Attempting to get health of external service '${componentName}', received response: 500`,
      `Failed getting health of external service '${componentName}'`,
    ])
  })

  it('should return DOWN with timeout message if the external service takes too long to respond', async () => {
    let connectionAttempts = 0
    nock.scope.delay(300).reply(200, () => {
      connectionAttempts += 1
    })

    endpointHealthComponentOptions.timeout = {
      response: 100,
      deadline: 200,
    }
    endpointHealthComponentOptions.retries = 2

    const endpointHealthComponent = new EndpointHealthComponent(logger, componentName, endpointHealthComponentOptions)

    const expectedConnectionAttempts = 1 + Number(endpointHealthComponentOptions.retries)
    const expectedResult = {
      name: componentName,
      status: 'DOWN',
      details: {
        message: 'Response timeout of 100ms exceeded',
        code: 'ECONNABORTED',
        error: 'ETIMEDOUT',
        attempts: expectedConnectionAttempts,
      },
    }

    const result = await endpointHealthComponent.health()

    expect(result).toEqual(expectedResult)
    expect(connectionAttempts).toEqual(expectedConnectionAttempts)
  })

  it('should only attempt once if retries are set to 0', async () => {
    let connectionAttempts = 0
    nock.scope.reply(500, () => {
      connectionAttempts += 1
    })

    endpointHealthComponentOptions.retries = 0

    const endpointHealthComponent = new EndpointHealthComponent(logger, componentName, endpointHealthComponentOptions)

    const expectedConnectionAttempts = 1 + Number(endpointHealthComponentOptions.retries)
    const expectedResult = {
      name: componentName,
      status: 'DOWN',
      details: {
        message: 'Internal Server Error',
        status: 500,
        attempts: expectedConnectionAttempts,
      },
    }

    const result = await endpointHealthComponent.health()

    expect(result).toEqual(expectedResult)
    expect(connectionAttempts).toEqual(expectedConnectionAttempts)
  })
})
