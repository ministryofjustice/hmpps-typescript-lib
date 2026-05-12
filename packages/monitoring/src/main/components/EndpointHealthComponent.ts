import { RestClient, type AgentConfig, type ApiConfig, type SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import type { Response as SuperAgentResponse } from 'superagent'
// annoyingly, eslint doesn't automatically consider @types/bunyan a dev depdendency, it's not even directly referenced here
// eslint-disable-next-line import/no-extraneous-dependencies
import Logger from 'bunyan'

import { EndpointHealthComponentOptions } from '../types/EndpointHealthComponentOptions'
import { ComponentHealthResult, HealthComponent } from '../types/HealthComponent'

type RetryError = Error & {
  code?: string
  timeout?: number
  crossDomain?: boolean
}

const RETRYABLE_ERROR_CODES = new Set([
  'ETIMEDOUT',
  'ECONNRESET',
  'EADDRINUSE',
  'ECONNREFUSED',
  'EPIPE',
  'ENOTFOUND',
  'ENETUNREACH',
  'EAI_AGAIN',
])

const RETRYABLE_STATUS_CODES = new Set([408, 413, 429, 500, 502, 503, 504, 521, 522, 524])

type HealthCheckResult = SuperAgentResponse | ComponentHealthResult

const restClientLogger = {
  debug: () => undefined,
  warn: () => undefined,
} as Console

/**
 * EndpointHealthComponent class implements the HealthComponent interface.
 * It checks the health status of an external service by sending HTTP requests to a specified endpoint.
 */
export default class EndpointHealthComponent implements HealthComponent {
  private readonly defaultOptions = {
    timeout: {
      response: 1500,
      deadline: 2000,
    },
    retries: 2,
    enabled: true,
  }

  private readonly healthUrl: string

  private readonly healthClient: RestClient

  constructor(
    private logger: Console | Logger,
    private readonly name: string,
    private readonly options: EndpointHealthComponentOptions,
  ) {
    this.healthUrl = `${options.url}${options.healthPath}`
    this.options = { ...this.defaultOptions, ...options } as EndpointHealthComponentOptions
    this.healthClient = new RestClient(`${name} health`, this.createApiConfig(this.options), restClientLogger)

    logger.info(`Monitoring health of external service '${name}' on: '${this.healthUrl}'`)
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
    const { retries } = this.options
    const { name } = this

    let attemptsCount = 1

    const response = await this.healthClient.get<HealthCheckResult, never>(
      {
        path: this.options.healthPath,
        raw: true,
        retries,
        retryHandler: () => (error, responseToRetry) => {
          const retryError = error as RetryError | undefined
          const retryStatus = typeof responseToRetry?.status === 'number' ? responseToRetry.status : undefined

          attemptsCount += 1

          if (retryError) {
            this.logger.info(
              `Attempting to get health of external service '${name}', got: ${retryError.name} - ${retryError.message}`,
            )

            return (
              (retryError.code && RETRYABLE_ERROR_CODES.has(retryError.code)) ||
              (retryError.timeout && retryError.code === 'ECONNABORTED') ||
              Boolean(retryError.crossDomain)
            )
          }

          if (retryStatus && RETRYABLE_STATUS_CODES.has(retryStatus)) {
            this.logger.info(
              `Attempting to get health of external service '${name}', received response: ${retryStatus}`,
            )

            return true
          }

          return false
        },
        errorHandler: (_path, _method, error) => this.toDownResult(error, attemptsCount),
      },
      undefined,
    )

    if (this.isDownResult(response)) {
      return {
        ...response,
      }
    }

    return {
      name,
      status: response.status >= 200 && response.status <= 299 ? 'UP' : 'DOWN',
    }
  }

  private createApiConfig(options: EndpointHealthComponentOptions): ApiConfig {
    const timeout =
      typeof options.timeout === 'number'
        ? { response: options.timeout, deadline: options.timeout }
        : {
            response: options.timeout?.response ?? this.defaultOptions.timeout.response,
            deadline: options.timeout?.deadline ?? this.defaultOptions.timeout.deadline,
          }

    return {
      url: options.url,
      timeout,
      agent: options.agentConfig as AgentConfig,
    }
  }

  private isDownResult(result: HealthCheckResult): result is ComponentHealthResult {
    return typeof result.status === 'string'
  }

  private toDownResult(error: SanitisedError, attemptsCount: number): ComponentHealthResult {
    this.logger.warn(`Failed getting health of external service '${this.name}'`, error.stack)

    if (error.responseStatus) {
      return {
        name: this.name,
        status: 'DOWN',
        details: {
          status: error.responseStatus,
          message: error.message || 'Error response from external service',
          attempts: attemptsCount,
        },
      }
    }

    return {
      name: this.name,
      status: 'DOWN',
      details: {
        code: error.code,
        error: error.errno,
        message: error.message || 'Unknown error',
        attempts: attemptsCount,
      },
    }
  }
}
