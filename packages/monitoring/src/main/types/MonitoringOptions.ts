import type { ApplicationInfo } from './DeploymentInfoType'
import type { ComponentHealthResult, HealthComponent } from './HealthComponent'

/**
 * Represents the overall health check result for the application.
 */
export interface HealthCheckResult {
  /** The overall health status of the application. */
  status: string
  /** (Optional) A mapping of component name to component health result. */
  components?: Record<string, Omit<ComponentHealthResult, 'name'>>
}

/**
 * Configuration options for performing health checks and relaying
 * service monitoring information.
 */
export interface MonitoringOptions {
  /** Information about the application being monitored. */
  applicationInfo: ApplicationInfo
  /** An array of health components to include in the health check. */
  healthComponents?: HealthComponent[]
}
