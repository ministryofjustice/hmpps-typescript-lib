import type { Request, Response, NextFunction } from 'express'

import HealthCheck from './HealthCheck'
import { MonitoringOptions } from './types/MonitoringOptions'
import DeploymentInfo from './DeploymentInfo'

/**
 * HealthCheckMiddleware class provides middleware functions for handling
 * health and deployment information endpoints in an Express.js application.
 *
 * Example:
 *
 * ```typescript
 * const healthMiddleware = new HealthCheckMiddleware(options);
 * app.get('/health', healthMiddleware.health);
 * app.get('/info', healthMiddleware.info);
 * app.get('/ping', healthMiddleware.ping);
 * ```
 */
export default class MonitoringMiddleware {
  private readonly healthCheck: HealthCheck

  private readonly deploymentInfo: DeploymentInfo

  constructor(options: MonitoringOptions) {
    this.healthCheck = new HealthCheck(options.healthComponents ?? [])
    this.deploymentInfo = new DeploymentInfo(options.applicationInfo)
  }

  /**
   * Middleware handler for the `/health` endpoint.
   * Generates a status report on individual components and the overall service health.
   * Responds with HTTP status 200 if all components are healthy, or 500 if any are unhealthy.
   */
  health = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const healthCheckResult = await this.healthCheck.check()
      const deploymentInfo = this.deploymentInfo.getShortInfo()

      res.status(healthCheckResult.status === 'UP' ? 200 : 500).json({
        ...healthCheckResult,
        ...deploymentInfo,
      })
    } catch (e) {
      next(e)
    }
  }

  /**
   * Middleware handler for the `/info` endpoint.
   * Returns JSON containing service information such as build details and Git branch.
   */
  info = (req: Request, res: Response, next: NextFunction) => {
    try {
      const info = this.deploymentInfo.getFullInfo()
      res.json(info)
    } catch (e) {
      next(e)
    }
  }

  /**
   * Middleware handler for the `/ping` endpoint.
   * Responds with a simple JSON object indicating the service is up.
   */
  ping = (req: Request, res: Response, next: NextFunction) => {
    res.json({
      status: 'UP',
    })
  }
}
