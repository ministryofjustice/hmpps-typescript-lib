import { createTestNock } from '../../test/utils'
import EndpointComponent from './EndpointComponent'
import type { EndpointComponentOptions } from '../types/EndpointComponentOptions'

describe('EndpointComponent', () => {
  let nock: ReturnType<typeof createTestNock>
  const componentName = 'test-component'
  let endpointComponentOptions: EndpointComponentOptions

  const messages = jest.fn()
  const logger = {
    info: messages,
    warn: messages,
  } as unknown as jest.Mocked<Console>

  beforeEach(() => {
    nock = createTestNock('get')
    endpointComponentOptions = {
      enabled: true,
      retries: 2,
      timeout: 1000,
      url: nock.url,
      healthPath: '',
    }
    jest.resetAllMocks()
  })

  afterEach(() => {
    nock.done()
  })

  it('should return UP status if the external service responds successfully', async () => {
    nock.scope.reply(200)
    const endpointComponent = new EndpointComponent(logger, componentName, endpointComponentOptions)

    const result = await endpointComponent.health()

    const expectedResult = {
      name: componentName,
      status: 'UP',
    }

    expect(result).toEqual(expectedResult)
  })

  it('should return DOWN status if the external service fails all retries', async () => {
    let connectionAttempts = 0
    nock.scope.reply(500, () => {
      connectionAttempts += 1
    })

    const endpointComponent = new EndpointComponent(logger, componentName, endpointComponentOptions)
    const result = await endpointComponent.health()

    const expectedConnectionAttempts = 1 + Number(endpointComponentOptions.retries)
    const expectedResult = {
      name: componentName,
      status: 'DOWN',
      details: {
        message: 'Internal Server Error',
        status: 500,
        attempts: Number(endpointComponentOptions.retries) + 1,
      },
    }

    expect(connectionAttempts).toEqual(expectedConnectionAttempts)
    expect(result).toEqual(expectedResult)
  })

  it('should log retries / failure if the external service', async () => {
    nock.scope.reply(500)

    const endpointComponent = new EndpointComponent(logger, componentName, endpointComponentOptions)
    await endpointComponent.health()

    const logMessages = messages.mock.calls.map(call => call[0])

    expect(logMessages).toStrictEqual([
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

    endpointComponentOptions.timeout = {
      response: 100,
      deadline: 200,
    }
    endpointComponentOptions.retries = 2

    const endpointComponent = new EndpointComponent(logger, componentName, endpointComponentOptions)

    const expectedConnectionAttempts = 1 + Number(endpointComponentOptions.retries)
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

    const result = await endpointComponent.health()

    expect(result).toEqual(expectedResult)
    expect(connectionAttempts).toEqual(expectedConnectionAttempts)
  })

  it('should only attempt once if retries are set to 0', async () => {
    let connectionAttempts = 0
    nock.scope.reply(500, () => {
      connectionAttempts += 1
    })

    endpointComponentOptions.retries = 0

    const endpointComponent = new EndpointComponent(logger, componentName, endpointComponentOptions)

    const expectedConnectionAttempts = 1 + Number(endpointComponentOptions.retries)
    const expectedResult = {
      name: componentName,
      status: 'DOWN',
      details: {
        message: 'Internal Server Error',
        status: 500,
        attempts: expectedConnectionAttempts,
      },
    }

    const result = await endpointComponent.health()

    expect(result).toEqual(expectedResult)
    expect(connectionAttempts).toEqual(expectedConnectionAttempts)
  })
})
