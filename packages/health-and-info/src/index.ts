import AgentOptions, { HttpOptions, HttpsAgent, HttpsOptions } from 'agentkeepalive'
import superagent from 'superagent'
import { Request, Response, NextFunction } from 'express'
import {
  ComponentCheckResult,
  ExternalComponent,
  CustomComponent,
  ApplicationInfo,
  HealthCheckOptions,
  HealthCheckResult,
} from './types/HealthCheckOptions'

export default class HealthCheck {
  private defaultOptions = {
    components: {
      retries: 2,
      timeout: {
        response: 1500,
        deadline: 2000,
      },
      enabled: true,
    },
  }

  constructor(
    private readonly options: HealthCheckOptions,
    private readonly logger: Console = console,
  ) {}

  private getDeploymentInfo = (appInfo: ApplicationInfo) => {
    return {
      build: {
        buildNumber: appInfo.buildNumber,
        gitRef: appInfo.gitRef,
      },
      version: appInfo.buildNumber,
      uptime: Math.floor(process.uptime()),
    }
  }

  private checkExternalComponents = (components: Partial<ExternalComponent | CustomComponent>[]) => {
    return components
      .filter(component => !('healthCheckFunction' in component))
      .map(component => ({ ...this.defaultOptions.components, ...component }) as ExternalComponent)
      .filter(component => component.enabled)
      .map(this.checkExternalComponent)
  }

  private checkExternalComponent = async (component: ExternalComponent): Promise<ComponentCheckResult> => {
    const { timeout, retries } = component
    const agent = component.url.startsWith('https')
      ? new HttpsAgent(component.agentConfig as HttpsOptions)
      : new AgentOptions(component.agentConfig as HttpOptions)
    let attemptsCount = 1

    try {
      const response = await superagent
        .get(component.url)
        .agent(agent)
        .timeout(timeout)
        .retry(retries, (err, res) => {
          attemptsCount += 1
          if (err) {
            this.logger.info(
              `Attempting to get health of external service ${component.name}, got: ${err.code} - ${err.message}`,
            )
          }
        })

      return {
        name: component.name,
        status: response.status === 200 ? 'UP' : 'DOWN',
      }
    } catch (error: unknown) {
      this.logger.warn(
        `Failed getting health of external service ${component.name}`,
        (error as superagent.ResponseError).stack,
      )

      return {
        name: component.name,
        status: 'DOWN',
        details: {
          status: (error as superagent.ResponseError).status,
          message: (error as superagent.ResponseError).message,
          attempts: attemptsCount,
        },
      }
    }
  }

  private checkCustomComponents = (components: Partial<ExternalComponent | CustomComponent>[]) => {
    return components
      .filter(component => 'healthCheckFunction' in component)
      .map(component => ({ ...this.defaultOptions.components, ...component }) as CustomComponent)
      .filter(component => component.enabled)
      .map(this.checkCustomComponent)
  }

  private checkCustomComponent = async (component: CustomComponent): Promise<ComponentCheckResult> => {
    try {
      const result = await component.healthCheckFunction()

      if (typeof result === 'boolean') {
        return {
          name: component.name,
          status: result ? 'UP' : 'DOWN',
        }
      }

      return {
        ...result,
        name: component.name,
      }
    } catch (error: unknown) {
      return {
        name: component.name,
        status: 'DOWN',
        details: {
          message: (error as Error).message,
        },
      }
    }
  }

  /** Run and return component health checks */
  check = async (): Promise<HealthCheckResult> => {
    const deploymentInfo = this.getDeploymentInfo(this.options.applicationInfo)
    if (this.options.components?.length) {
      const componentHealth = await Promise.all([
        ...this.checkCustomComponents(this.options.components),
        ...this.checkExternalComponents(this.options.components),
      ])

      return {
        status: componentHealth.some(component => component.status === 'DOWN') ? 'DOWN' : 'UP',
        components: componentHealth,
        ...deploymentInfo,
      }
    }

    return {
      status: 'UP',
      ...deploymentInfo,
    }
  }

  /**
   * Middleware handler for the `/health` endpoint.
   * Generates a status report on individual components and the overall service health.
   * Responds with HTTP status 200 if all components are healthy, or 500 if any are unhealthy.
   */
  private health = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const check = await this.check()
      res.status(check.status === 'UP' ? 200 : 500).json(check)
    } catch (e) {
      next(e)
    }
  }

  /**
   * Middleware handler for the `/info` endpoint.
   * Returns JSON containing service information such as build details and Git branch.
   */
  private info = async (req: Request, res: Response, next: NextFunction) => {
    res.json({
      git: {
        branch: this.options.applicationInfo.branchName,
      },
      build: {
        artifact: this.options.applicationInfo.applicationName,
        version: this.options.applicationInfo.buildNumber,
        name: this.options.applicationInfo.applicationName,
      },
      productId: this.options.applicationInfo.productId,
    })
  }

  /**
   * Middleware handler for the `/ping` endpoint.
   * Responds with a simple JSON object indicating the service is up.
   */
  private ping = async (req: Request, res: Response, next: NextFunction) => {
    res.json({
      status: 'UP',
    })
  }

  middleware = {
    health: this.health,
    info: this.info,
    ping: this.ping,
  }
}
