import { HttpOptions, HttpsOptions } from 'agentkeepalive'

/**
 * Contains information about the application's build and version.
 */
export interface ApplicationInfo {
  /** The build number of the application. */
  buildNumber: string
  /** The name of the application. */
  applicationName: string
  /** (Optional) The service catalogue/product ID associated with the application. */
  productId?: string
  /** The name of the branch from which the application was built. */
  branchName: string
  /** The reference (commit hash) of the build. */
  gitRef: string
}

/**
 * Represents the result of a health check for a component.
 */
export interface ComponentCheckResult {
  /** The name of the component. */
  name?: string
  /** The health status of the component: 'UP' or 'DOWN'. */
  status: 'UP' | 'DOWN'
  /** Additional details about the component's health status. */
  details?: {
    /** (Optional) Error message status */
    status?: string | number
    /** (Optional) Message providing more information about the status. */
    message?: string
    /** (Optional) Amount of attempts made */
    attempts?: number
    /** Additional key-value pairs with more details, mainly for custom components */
    [key: string]: string | number | boolean | undefined
  }
}

/**
 * Represents the overall health check result for the application.
 */
export interface HealthCheckResult {
  /** The overall health status of the application. */
  status: string
  /** (Optional) An array of health check results for individual components. */
  components?: ComponentCheckResult[]
  /** Information about the application's build. */
  build: {
    /** The build number of the application. */
    buildNumber: string
    /** The reference (commit hash) of the build. */
    gitRef: string
  }
  /** The version number of the application. */
  version: string
  /** The uptime of the application in seconds. */
  uptime: number
}

interface Component {
  /** The name of the component. */
  name: string
  /** Indicates whether the component is enabled for health checks. */
  enabled: boolean
}

export interface ExternalComponent extends Component {
  /** The URL endpoint of the external service to be health-checked. */
  url: string
  /** The timeout settings for the component's health check, matches SARequest.timeout from superagent */
  timeout:
    | number
    | {
        response?: number
        deadline?: number
      }
  /** The number of retry attempts for the health check. */
  retries: number
  /** (Optional) Agent configuration options for HTTP/HTTPS requests to the service. */
  agentConfig?: HttpsOptions | HttpOptions
}

/**
 * Represents a custom component with a user-defined health check function.
 */
export interface CustomComponent extends Component {
  /**
   * A custom function that performs the health check and returns a result.
   * It should return either a boolean indicating the status,
   * or a `ComponentCheckResult` object with more detailed information.
   */
  healthCheckFunction: () => ComponentCheckResult | boolean
}

/**
 * Configuration options for performing health checks.
 */
export interface HealthCheckOptions {
  /** Information about the application being health-checked. */
  applicationInfo: ApplicationInfo
  /**
   * An array of components to include in the health check.
   * Each component can be partially specified, inheriting default values for unspecified properties.
   */
  components?: Partial<CustomComponent | ExternalComponent>[]
}
