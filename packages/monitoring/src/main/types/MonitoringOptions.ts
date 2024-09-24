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
 * Configuration options for performing health checks and relaying
 * service monitoring information.
 */
export interface MonitoringOptions {
  /** Information about the application being monitored. */
  applicationInfo: ApplicationInfo
  /** An array of components to include in the health check. */
  components?: HealthComponent[]
}
