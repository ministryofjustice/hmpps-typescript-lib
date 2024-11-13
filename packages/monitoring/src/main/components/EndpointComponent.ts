import Agent, { HttpOptions, HttpsOptions, HttpsAgent } from 'agentkeepalive'
import superagent from 'superagent'
// annoyingly, eslint doesn't automatically consider @types/bunyuan a dev depdendency, it's not even directly referenced here
// eslint-disable-next-line import/no-extraneous-dependencies
import Logger from 'bunyan'

import { EndpointComponentOptions } from '../types/EndpointComponentOptions'
import { ComponentHealthResult, HealthComponent } from '../types/HealthComponent'

/**
 * EndpointComponent class implements the HealthComponent interface.
 * It checks the health status of an external service by sending HTTP requests to a specified endpoint.
 */
export default class EndpointComponent implements HealthComponent {
  private readonly defaultOptions = {
    timeout: {
      response: 1500,
      deadline: 2000,
    },
    retries: 2,
    enabled: true,
  }

  private readonly agent: Agent

  constructor(
    private logger: Console | Logger,
    private readonly name: string,
    private readonly options: EndpointComponentOptions,
  ) {
    this.agent = options.url.startsWith('https')
      ? new HttpsAgent(options.agentConfig as HttpsOptions)
      : new Agent(options.agentConfig as HttpOptions)

    this.options = { ...this.defaultOptions, ...options } as EndpointComponentOptions
  }

  /**
   * Checks if the component is enabled.
   *
   * @returns True if the component is enabled, otherwise false.
   */
  isEnabled = () => {
    return this.options.enabled !== undefined ? this.options.enabled : this.defaultOptions.enabled
  }

  /**
   * Performs a health check by sending a GET request to the external service's endpoint.
   * It retries the request based on the provided configuration in case of failure.
   *
   * @returns A promise that resolves to a ComponentCheckResult, indicating the health status of the service.
   */
  health = async (): Promise<ComponentHealthResult> => {
    const { url, timeout, retries } = this.options
    const { name } = this

    let attemptsCount = 1

    try {
      const response = await superagent
        .get(url)
        .agent(this.agent)
        .timeout(timeout as number)
        .retry(retries, (err, res) => {
          attemptsCount += 1
          if (err) {
            this.logger.info(
              `Attempting to get health of external service '${name}', got: ${err.code} - ${err.message}`,
            )
          } else if (res?.clientError || res?.serverError) {
            this.logger.info(
              `Attempting to get health of external service '${name}', received response: ${res.statusCode}`,
            )
          }
        })

      return {
        name,
        status: response.status === 200 ? 'UP' : 'DOWN',
      }
    } catch (error: unknown) {
      this.logger.warn(`Failed getting health of external service '${name}'`, (error as superagent.ResponseError).stack)

      const responseError = error as superagent.ResponseError
      if (responseError?.response) {
        return {
          name,
          status: 'DOWN',
          details: {
            status: responseError.status,
            message: responseError.message || 'Error response from external service',
            attempts: attemptsCount,
          },
        }
      }

      const genericError = error as NodeJS.ErrnoException
      return {
        name,
        status: 'DOWN',
        details: {
          code: genericError.code,
          error: genericError.errno,
          message: genericError.message || 'Unknown error',
          attempts: attemptsCount,
        },
      }
    }
  }
}
