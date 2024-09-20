import { ApplicationInfo } from './DeploymentInfoType'
import { ComponentHealthResult, HealthComponent } from './HealthComponent'

/**
 * Represents the overall health check result for the application.
 */
export interface HealthCheckResult {
  /** The overall health status of the application. */
  status: string
  /** (Optional) An array of health check results for individual components. */
  components?: ComponentHealthResult[]
}

/**
 * Configuration options for performing health checks.
 */
export interface HealthCheckOptions {
  /** Information about the application being health-checked. */
  applicationInfo: ApplicationInfo
  /** An array of components to include in the health check. */
  components?: HealthComponent[]
}
