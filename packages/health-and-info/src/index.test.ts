import superagent from 'superagent'
import { Request, Response } from 'express'
import { ExternalComponent, HealthCheckOptions } from './types/HealthCheckOptions'
import HealthCheck from './index'
import { createTestNock } from './test/utils'

describe('health-and-info', () => {
  let healthCheckOptions: HealthCheckOptions
  let healthChecker: HealthCheck

  describe('check', () => {
    it('should return UP status if no components', async () => {
      healthCheckOptions = {
        applicationInfo: {
          buildNumber: '1',
          gitRef: '1',
          branchName: 'main',
          applicationName: 'test-app',
          productId: 'product-123',
        },
        components: [],
      }
      healthChecker = new HealthCheck(healthCheckOptions)

      const result = await healthChecker.check()
      const expectedResult = {
        status: 'UP',
        version: '1',
        build: {
          buildNumber: healthCheckOptions.applicationInfo.buildNumber,
          gitRef: healthCheckOptions.applicationInfo.gitRef,
        },
        uptime: expect.any(Number),
      }

      expect(result).toEqual(expectedResult)
    })

    it('should return UP status if all components healthy', async () => {
      const nock = createTestNock('get')
      nock.scope.reply(200)
      const healthCheckFunction = jest.fn().mockResolvedValue(true)

      healthCheckOptions = {
        applicationInfo: {
          buildNumber: '1',
          gitRef: '1',
          branchName: 'main',
          applicationName: 'test-app',
          productId: 'product-123',
        },
        components: [
          {
            name: 'test-component',
            healthCheckFunction,
          },
          {
            name: 'test-service',
            url: nock.url,
          },
        ],
      }
      healthChecker = new HealthCheck(healthCheckOptions)

      const result = await healthChecker.check()
      const expectedResult = {
        status: 'UP',
        components: [
          {
            name: healthCheckOptions.components![0].name,
            status: 'UP',
          },
          {
            name: healthCheckOptions.components![1].name,
            status: 'UP',
          },
        ],
        version: '1',
        build: {
          buildNumber: healthCheckOptions.applicationInfo.buildNumber,
          gitRef: healthCheckOptions.applicationInfo.gitRef,
        },
        uptime: expect.any(Number),
      }

      expect(result).toEqual(expectedResult)
    })

    it('should return DOWN status if any components unhealthy', async () => {
      const nock = createTestNock('get')
      nock.scope.reply(200)
      const healthCheckFunction = jest.fn().mockResolvedValue(false)

      healthCheckOptions = {
        applicationInfo: {
          buildNumber: '1',
          gitRef: '1',
          branchName: 'main',
          applicationName: 'test-app',
          productId: 'product-123',
        },
        components: [
          {
            name: 'test-component',
            healthCheckFunction,
          },
          {
            name: 'test-service',
            url: nock.url,
          },
        ],
      }
      healthChecker = new HealthCheck(healthCheckOptions)

      const result = await healthChecker.check()
      const expectedResult = {
        status: 'DOWN',
        components: [
          {
            name: healthCheckOptions.components![0].name,
            status: 'DOWN',
          },
          {
            name: healthCheckOptions.components![1].name,
            status: 'UP',
          },
        ],
        version: '1',
        build: {
          buildNumber: healthCheckOptions.applicationInfo.buildNumber,
          gitRef: healthCheckOptions.applicationInfo.gitRef,
        },
        uptime: expect.any(Number),
      }

      expect(result).toEqual(expectedResult)
    })
  })

  describe('middleware', () => {
    describe('health', () => {
      it('should return 200 status with JSON if all components healthy', async () => {
        const nock = createTestNock('get')
        nock.scope.reply(200)
        const healthCheckFunction = jest.fn().mockResolvedValue(true)

        healthCheckOptions = {
          applicationInfo: {
            buildNumber: '1',
            gitRef: '1',
            branchName: 'main',
            applicationName: 'test-app',
            productId: 'product-123',
          },
          components: [
            {
              name: 'test-component',
              healthCheckFunction,
            },
            {
              name: 'test-service',
              url: nock.url,
            },
          ],
        }
        healthChecker = new HealthCheck(healthCheckOptions)

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        } as unknown as Response

        await healthChecker.middleware.health({} as Request, mockRes, jest.fn)
        const expectedBody = {
          status: 'UP',
          components: [
            {
              name: healthCheckOptions.components![0].name,
              status: 'UP',
            },
            {
              name: healthCheckOptions.components![1].name,
              status: 'UP',
            },
          ],
          version: '1',
          build: {
            buildNumber: healthCheckOptions.applicationInfo.buildNumber,
            gitRef: healthCheckOptions.applicationInfo.gitRef,
          },
          uptime: expect.any(Number),
        }

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith(expectedBody)
      })

      it('should return 500 status with JSON if any components unhealthy', async () => {
        const nock = createTestNock('get')
        nock.scope.reply(200)
        const healthCheckFunction = jest.fn().mockResolvedValue(false)

        healthCheckOptions = {
          applicationInfo: {
            buildNumber: '1',
            gitRef: '1',
            branchName: 'main',
            applicationName: 'test-app',
            productId: 'product-123',
          },
          components: [
            {
              name: 'test-component',
              healthCheckFunction,
            },
            {
              name: 'test-service',
              url: nock.url,
            },
          ],
        }
        healthChecker = new HealthCheck(healthCheckOptions)

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        } as unknown as Response

        await healthChecker.middleware.health({} as Request, mockRes, jest.fn)
        const expectedBody = {
          status: 'DOWN',
          components: [
            {
              name: healthCheckOptions.components![0].name,
              status: 'DOWN',
            },
            {
              name: healthCheckOptions.components![1].name,
              status: 'UP',
            },
          ],
          version: '1',
          build: {
            buildNumber: healthCheckOptions.applicationInfo.buildNumber,
            gitRef: healthCheckOptions.applicationInfo.gitRef,
          },
          uptime: expect.any(Number),
        }

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.json).toHaveBeenCalledWith(expectedBody)
      })

      it('should forward thrown error to next', async () => {
        healthCheckOptions = {
          applicationInfo: {
            buildNumber: '1',
            gitRef: '1',
            branchName: 'main',
            applicationName: 'test-app',
            productId: 'product-123',
          },
          components: [
            {
              name: 'test-component',
            },
            {
              name: 'test-service',
              url: 'doesnt-matter',
            },
          ],
        }
        const testError = Error('test-error-message')
        healthChecker = new HealthCheck(healthCheckOptions)
        healthChecker.check = jest.fn().mockRejectedValue(testError)

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        } as unknown as Response
        const mockNext = jest.fn()

        await healthChecker.middleware.health({} as Request, mockRes, mockNext)

        expect(mockRes.status).not.toHaveBeenCalled()
        expect(mockNext).toHaveBeenCalledWith(testError)
      })
    })

    describe('info', () => {
      it('should return application info in JSON format', async () => {
        healthCheckOptions = {
          applicationInfo: {
            buildNumber: '1',
            gitRef: '1',
            branchName: 'main',
            applicationName: 'test-app',
            productId: 'product-123',
          },
          components: [],
        }
        healthChecker = new HealthCheck(healthCheckOptions)

        const mockRes = {
          json: jest.fn(),
        } as unknown as Response

        await healthChecker.middleware.info({} as Request, mockRes, jest.fn)

        const expectedBody = {
          git: {
            branch: healthCheckOptions.applicationInfo.branchName,
          },
          build: {
            artifact: healthCheckOptions.applicationInfo.applicationName,
            version: healthCheckOptions.applicationInfo.buildNumber,
            name: healthCheckOptions.applicationInfo.applicationName,
          },
          productId: healthCheckOptions.applicationInfo.productId,
        }

        expect(mockRes.json).toHaveBeenCalledWith(expectedBody)
      })
    })

    describe('ping', () => {
      it('should return status "UP" in JSON format', async () => {
        healthCheckOptions = {
          applicationInfo: {
            buildNumber: '1',
            gitRef: '1',
            branchName: 'main',
            applicationName: 'test-app',
            productId: 'product-123',
          },
          components: [],
        }
        healthChecker = new HealthCheck(healthCheckOptions)

        const mockRes = {
          json: jest.fn(),
        } as unknown as Response

        await healthChecker.middleware.ping({} as Request, mockRes, jest.fn)

        const expectedBody = {
          status: 'UP',
        }

        expect(mockRes.json).toHaveBeenCalledWith(expectedBody)
      })
    })
  })

  describe('externalComponent', () => {
    let nock: ReturnType<typeof createTestNock>

    beforeEach(() => {
      nock = createTestNock('get')
      healthCheckOptions = {
        applicationInfo: {
          buildNumber: '1',
          gitRef: '1',
          branchName: 'main',
          applicationName: 'test-app',
          productId: 'product-123',
        },
        components: [
          {
            name: 'test-service',
            retries: 2,
            url: nock.url,
          },
        ],
      }
      healthChecker = new HealthCheck(healthCheckOptions)
    })

    it('should return UP status if the external service responds successfully', async () => {
      nock.scope.reply(200)

      const expectedResult = {
        name: healthCheckOptions.components![0].name,
        status: 'UP',
      }

      const result = await healthChecker.check()

      expect(result.components![0]).toEqual(expectedResult)
      nock.done()
    })

    it('should return DOWN status if the external service fails all retries', async () => {
      let connectionAttempts = 0
      nock.scope.reply(500, () => {
        connectionAttempts += 1
      })

      const testComponent = healthCheckOptions.components![0] as ExternalComponent
      const result = await healthChecker.check()

      const expectedConnectionAttempts = 1 + Number(testComponent.retries)
      const expectedResult = {
        name: testComponent.name,
        status: 'DOWN',
        details: {
          message: 'Internal Server Error',
          status: 500,
          attempts: Number(testComponent.retries) + 1,
        },
      }

      expect(connectionAttempts).toEqual(expectedConnectionAttempts)
      expect(result.components![0]).toEqual(expectedResult)
      nock.done()
    })

    it('should return DOWN with timeout message if the external service takes too long to respond', async () => {
      let connectionAttempts = 0
      nock.scope.delay(300).reply(200, () => {
        connectionAttempts += 1
      })

      const testComponent = healthCheckOptions.components![0] as ExternalComponent
      testComponent.timeout = {
        response: 100,
        deadline: 200,
      }

      const expectedConnectionAttempts = 1 + Number(testComponent.retries)
      const expectedResult = {
        name: healthCheckOptions.components![0].name,
        status: 'DOWN',
        details: {
          message: 'Response timeout of 100ms exceeded',
          attempts: Number(testComponent.retries) + 1,
        },
      }

      const result = await healthChecker.check()

      expect(result.components![0]).toEqual(expectedResult)
      expect(connectionAttempts).toEqual(expectedConnectionAttempts)
      nock.done()
    })

    it('should only attempt once if retries are set to 0', async () => {
      let connectionAttempts = 0
      nock.scope.reply(500, () => {
        connectionAttempts += 1
      })

      const testComponent = healthCheckOptions.components![0] as ExternalComponent
      testComponent.retries = 0

      const expectedConnectionAttempts = 1 + Number(testComponent.retries)
      const expectedResult = {
        name: healthCheckOptions.components![0].name,
        status: 'DOWN',
        details: {
          message: 'Internal Server Error',
          status: 500,
          attempts: testComponent.retries + 1,
        },
      }

      const result = await healthChecker.check()

      expect(result.components![0]).toEqual(expectedResult)
      expect(connectionAttempts).toEqual(expectedConnectionAttempts)
      nock.done()
    })

    it('should provide correct options to superagent', async () => {
      const superagentSpy = jest.spyOn(superagent, 'get') as jest.SpyInstance<superagent.SuperAgentRequest>
      const mockGetFn = {
        agent: jest.fn().mockReturnThis(),
        retry: jest.fn().mockReturnThis(),
        timeout: jest.fn().mockReturnThis(),
      }
      superagentSpy.mockReturnValueOnce(mockGetFn as unknown as superagent.SuperAgentRequest)

      const testComponent = healthCheckOptions.components![0] as ExternalComponent
      testComponent.timeout = {
        response: 2000,
        deadline: 4000,
      }

      await healthChecker.check()

      expect(superagentSpy).toHaveBeenCalledWith(testComponent.url)
      expect(mockGetFn.timeout).toHaveBeenCalledWith(testComponent.timeout)
      expect(mockGetFn.retry).toHaveBeenCalledWith(testComponent.retries, expect.any(Function))
    })

    it('should handle http', async () => {
      nock = createTestNock('get', 'http://test.local')
      nock.scope.reply(200)
      ;(healthCheckOptions.components![0] as ExternalComponent).url = nock.url

      const expectedResult = {
        name: healthCheckOptions.components![0].name,
        status: 'UP',
      }

      const result = await healthChecker.check()

      expect(result.components![0]).toEqual(expectedResult)
      nock.done()
    })
  })

  describe('customComponent', () => {
    let healthCheckFunction: jest.Mock

    beforeEach(() => {
      healthCheckFunction = jest.fn()
      healthCheckOptions = {
        applicationInfo: {
          buildNumber: '1',
          gitRef: '1',
          branchName: 'main',
          applicationName: 'test-app',
          productId: 'product-123',
        },
        components: [
          {
            name: 'test-component',
            healthCheckFunction,
          },
        ],
      }
      healthChecker = new HealthCheck(healthCheckOptions)
    })

    it('should return UP if custom health function returns true', async () => {
      healthCheckFunction.mockResolvedValue(true)

      const result = await healthChecker.check()
      const expectedResult = {
        name: 'test-component',
        status: 'UP',
      }

      expect(result.components![0]).toEqual(expectedResult)
    })

    it('should return UP with details custom health function returns up ComponentCheckResult', async () => {
      healthCheckFunction.mockResolvedValue({
        status: 'UP',
        details: {
          message: 'test-message',
        },
      })

      const result = await healthChecker.check()
      const expectedResult = {
        name: 'test-component',
        status: 'UP',
        details: {
          message: 'test-message',
        },
      }

      expect(result.components![0]).toEqual(expectedResult)
    })

    it('should return DOWN if custom health function returns false', async () => {
      healthCheckFunction.mockResolvedValue(false)

      const result = await healthChecker.check()
      const expectedResult = {
        name: 'test-component',
        status: 'DOWN',
      }

      expect(result.components![0]).toEqual(expectedResult)
    })

    it('should return DOWN with details custom health function returns down ComponentCheckResult', async () => {
      healthCheckFunction.mockResolvedValue({
        status: 'DOWN',
        details: {
          message: 'test-message',
        },
      })

      const result = await healthChecker.check()
      const expectedResult = {
        name: 'test-component',
        status: 'DOWN',
        details: {
          message: 'test-message',
        },
      }

      expect(result.components![0]).toEqual(expectedResult)
    })

    it('should return DOWN with details if custom health function throws error', async () => {
      healthCheckFunction.mockRejectedValue(Error('test-error-message'))
      const result = await healthChecker.check()
      const expectedResult = {
        name: 'test-component',
        status: 'DOWN',
        details: {
          message: 'test-error-message',
        },
      }

      expect(result.components![0]).toEqual(expectedResult)
    })

    it('should check custom health function is called', async () => {
      healthCheckFunction.mockResolvedValue(true)
      await healthChecker.check()

      expect(healthCheckFunction).toHaveBeenCalledTimes(1)
    })
  })
})
