import MonitoringMiddleware from './MonitoringMiddleware'
import EndpointHealthComponent from './components/EndpointHealthComponent'

/**
 * monitoringMiddleware provides middleware functions for handling
 * health and deployment information endpoints in an Express.js application.
 *
 * Example:
 *
 * ```typescript
 * const middleware = monitoringMiddleware(options);
 * app.get('/health', middleware.health);
 * app.get('/info', middleware.info);
 * app.get('/ping', middleware.ping);
 * ```
 */
export function monitoringMiddleware(...args: ConstructorParameters<typeof MonitoringMiddleware>) {
  return new MonitoringMiddleware(...args)
}

/**
 * EndpointHealthComponent class implements the HealthComponent interface.
 * It checks the health status of an external service by sending HTTP requests to a specified endpoint.
 */
export function endpointHealthComponent(...args: ConstructorParameters<typeof EndpointHealthComponent>) {
  return new EndpointHealthComponent(...args)
}

export type { HealthComponent, ComponentHealthResult } from './types/HealthComponent'
export type { EndpointHealthComponentOptions } from './types/EndpointHealthComponentOptions'
