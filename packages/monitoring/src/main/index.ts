import MonitoringMiddleware from './MonitoringMiddleware'
import EndpointComponent from './components/EndpointComponent'

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
 * EndpointComponent class implements the HealthComponent interface.
 * It checks the health status of an external service by sending HTTP requests to a specified endpoint.
 */
export function endpointComponent(...args: ConstructorParameters<typeof EndpointComponent>) {
  return new EndpointComponent(...args)
}

export type { HealthComponent, ComponentHealthResult } from './types/HealthComponent'
