import { NextFunction, Request, Response } from 'express'
import HealthCheckMiddleware from './HealthCheckMiddleware'
import HealthCheck from './HealthCheck'
import DeploymentInfo from './DeploymentInfo'

import { HealthCheckOptions } from './types/HealthCheckOptions'

jest.mock('./HealthCheck')
jest.mock('./DeploymentInfo')

const MockedHealthCheck = HealthCheck as jest.MockedClass<typeof HealthCheck>
const MockedDeploymentInfo = DeploymentInfo as jest.MockedClass<typeof DeploymentInfo>

describe('HealthCheckMiddleware', () => {
  const mockHealthyService = {
    status: 'UP',
    components: [
      {
        name: 'mock-component-1',
        status: 'UP',
      },
      {
        name: 'mock-component-2',
        status: 'UP',
      },
    ],
  }

  const mockUnHealthyService = {
    status: 'DOWN',
    components: [
      {
        name: 'mock-component-1',
        status: 'UP',
      },
      {
        name: 'mock-component-2',
        status: 'DOWN',
      },
    ],
  }

  const mockShortDeploymentInfo = {
    version: '1',
    build: {
      buildNumber: '1',
      gitRef: '1',
    },
    uptime: 5,
  }

  const mockFullDeploymentInfo = {
    git: {
      branch: 'main',
    },
    build: {
      artifact: 'test-service-name',
      version: '1',
      name: 'test-service-name',
    },
    productId: 'AL5X',
    uptime: 5,
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
      const healthCheckMiddleware = new HealthCheckMiddleware({} as HealthCheckOptions)
      ;(MockedHealthCheck.prototype.check as jest.Mock).mockResolvedValue(mockHealthyService)
      ;(MockedDeploymentInfo.prototype.getShortInfo as jest.Mock).mockReturnValue(mockShortDeploymentInfo)

      await healthCheckMiddleware.health(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({ ...mockHealthyService, ...mockShortDeploymentInfo })
    })

    it('should return 500 status with JSON if any components unhealthy', async () => {
      const healthCheckMiddleware = new HealthCheckMiddleware({} as HealthCheckOptions)
      ;(MockedHealthCheck.prototype.check as jest.Mock).mockResolvedValue(mockUnHealthyService)
      ;(MockedDeploymentInfo.prototype.getShortInfo as jest.Mock).mockReturnValue(mockShortDeploymentInfo)

      await healthCheckMiddleware.health(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ ...mockUnHealthyService, ...mockShortDeploymentInfo })
    })

    it('should forward thrown error to next', async () => {
      const testError = Error('test-error-message')
      const healthCheckMiddleware = new HealthCheckMiddleware({} as HealthCheckOptions)
      ;(MockedHealthCheck.prototype.check as jest.Mock).mockRejectedValue(testError)

      await healthCheckMiddleware.health(mockReq, mockRes, mockNext)

      expect(mockRes.status).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith(testError)
    })
  })

  describe('info', () => {
    it('should return application info in JSON format', async () => {
      const healthCheckMiddleware = new HealthCheckMiddleware({} as HealthCheckOptions)
      ;(MockedDeploymentInfo.prototype.getFullInfo as jest.Mock).mockReturnValue(mockFullDeploymentInfo)

      await healthCheckMiddleware.info(mockReq, mockRes, mockNext)

      expect(mockRes.json).toHaveBeenCalledWith(mockFullDeploymentInfo)
    })
  })

  describe('ping', () => {
    it('should return status "UP" in JSON format', async () => {
      const healthCheckMiddleware = new HealthCheckMiddleware({} as HealthCheckOptions)

      await healthCheckMiddleware.ping(mockReq, mockRes, mockNext)

      const expectedBody = {
        status: 'UP',
      }

      expect(mockRes.json).toHaveBeenCalledWith(expectedBody)
    })
  })
})
