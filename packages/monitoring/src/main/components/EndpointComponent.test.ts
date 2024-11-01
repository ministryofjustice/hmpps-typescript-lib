import { createTestNock } from '../../test/utils'
import EndpointComponent from './EndpointComponent'
import type EndpointComponentOptions from '../types/EndpointComponentOptions'

describe('EndpointComponent', () => {
  let nock: ReturnType<typeof createTestNock>
  let endpointComponentOptions: EndpointComponentOptions

  beforeEach(() => {
    nock = createTestNock('get')
    endpointComponentOptions = {
      name: 'test-component',
      enabled: true,
      retries: 2,
      timeout: 1000,
      url: nock.url,
    }
  })

  it('should return UP status if the external service responds successfully', async () => {
    nock.scope.reply(200)
    const endpointComponent = new EndpointComponent(endpointComponentOptions)

    const result = await endpointComponent.health()

    const expectedResult = {
      name: endpointComponentOptions.name,
      status: 'UP',
    }

    expect(result).toEqual(expectedResult)
    nock.done()
  })

  it('should return DOWN status if the external service fails all retries', async () => {
    let connectionAttempts = 0
    nock.scope.reply(500, () => {
      connectionAttempts += 1
    })

    const endpointComponent = new EndpointComponent(endpointComponentOptions)
    const result = await endpointComponent.health()

    const expectedConnectionAttempts = 1 + Number(endpointComponentOptions.retries)
    const expectedResult = {
      name: endpointComponentOptions.name,
      status: 'DOWN',
      details: {
        message: 'Internal Server Error',
        status: 500,
        attempts: Number(endpointComponentOptions.retries) + 1,
      },
    }

    expect(connectionAttempts).toEqual(expectedConnectionAttempts)
    expect(result).toEqual(expectedResult)
    nock.done()
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

    const endpointComponent = new EndpointComponent(endpointComponentOptions)

    const expectedConnectionAttempts = 1 + Number(endpointComponentOptions.retries)
    const expectedResult = {
      name: endpointComponentOptions.name,
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
    nock.done()
  })

  it('should only attempt once if retries are set to 0', async () => {
    let connectionAttempts = 0
    nock.scope.reply(500, () => {
      connectionAttempts += 1
    })

    endpointComponentOptions.retries = 0

    const endpointComponent = new EndpointComponent(endpointComponentOptions)

    const expectedConnectionAttempts = 1 + Number(endpointComponentOptions.retries)
    const expectedResult = {
      name: endpointComponentOptions.name,
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
    nock.done()
  })
})
