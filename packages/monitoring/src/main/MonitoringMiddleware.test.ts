import { NextFunction, Request, Response } from 'express'
import MonitoringMiddleware from './MonitoringMiddleware'
import { MonitoringOptions } from './types/MonitoringOptions'
import { createHealthComponentMock } from '../test/utils'
import { HealthComponent } from './types/HealthComponent'

describe('HealthCheckMiddleware', () => {
  const mockApplicationInfo = {
    buildNumber: '1.0.0',
    gitRef: 'abc123',
    branchName: 'main',
    applicationName: 'test-service-name',
    productId: 'prod-123',
  }

  const mockShortDeploymentInfo = {
    version: '1.0.0',
    build: {
      buildNumber: '1.0.0',
      gitRef: 'abc123',
    },
    uptime: expect.any(Number),
  }

  const mockFullDeploymentInfo = {
    git: {
      branch: 'main',
    },
    build: {
      artifact: 'test-service-name',
      version: '1.0.0',
      name: 'test-service-name',
    },
    productId: 'prod-123',
    uptime: expect.any(Number),
  }

  let mockReq: Request
  let mockRes: Response
  let mockNext: NextFunction

  beforeEach(() => {
    mockReq = {} as Request
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response
    mockNext = jest.fn()
  })

  describe('health', () => {
    it('should return 200 status with JSON if all components healthy', async () => {
      const mockComponent = createHealthComponentMock(true)
      const healthCheckOptions = {
        applicationInfo: mockApplicationInfo,
        components: [mockComponent],
      }
      const healthCheckMiddleware = new MonitoringMiddleware(healthCheckOptions)

      await healthCheckMiddleware.health(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'UP',
        components: [
          {
            name: mockComponent.options.name,
            status: 'UP',
          },
        ],
        ...mockShortDeploymentInfo,
      })
    })

    it('should return 500 status with JSON if any components unhealthy', async () => {
      const mockComponent = createHealthComponentMock(false)
      const healthCheckOptions = {
        applicationInfo: mockApplicationInfo,
        components: [mockComponent],
      }
      const healthCheckMiddleware = new MonitoringMiddleware(healthCheckOptions)

      await healthCheckMiddleware.health(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'DOWN',
        components: [
          {
            name: mockComponent.options.name,
            status: 'DOWN',
          },
        ],
        ...mockShortDeploymentInfo,
      })
    })

    it('should forward thrown error to next', async () => {
      const healthCheckOptions = {
        applicationInfo: mockApplicationInfo,
        components: [false as unknown as HealthComponent],
      }
      const healthCheckMiddleware = new MonitoringMiddleware(healthCheckOptions)

      await healthCheckMiddleware.health(mockReq, mockRes, mockNext)

      const testError = TypeError('component.isEnabled is not a function')

      expect(mockRes.status).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith(testError)
    })
  })

  describe('info', () => {
    it('should return application info in JSON format', async () => {
      const healthCheckOptions = {
        applicationInfo: mockApplicationInfo,
      }
      const healthCheckMiddleware = new MonitoringMiddleware(healthCheckOptions)

      await healthCheckMiddleware.info(mockReq, mockRes, mockNext)

      expect(mockRes.json).toHaveBeenCalledWith(mockFullDeploymentInfo)
    })
  })

  describe('ping', () => {
    it('should return status "UP" in JSON format', async () => {
      const healthCheckMiddleware = new MonitoringMiddleware({} as MonitoringOptions)

      await healthCheckMiddleware.ping(mockReq, mockRes, mockNext)

      const expectedBody = {
        status: 'UP',
      }

      expect(mockRes.json).toHaveBeenCalledWith(expectedBody)
    })
  })
})
