import HealthCheckMiddleware from './HealthCheckMiddleware'
import EndpointComponent from './components/EndpointComponent'

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
export function healthCheckMiddleware(...args: ConstructorParameters<typeof HealthCheckMiddleware>) {
  return new HealthCheckMiddleware(...args)
}

/**
 * EndpointComponent class implements the HealthComponent interface.
 * It checks the health status of an external service by sending HTTP requests to a specified endpoint.
 */
export function endpointComponent(...args: ConstructorParameters<typeof EndpointComponent>) {
  return new EndpointComponent(...args)
}

export type { HealthComponent, ComponentHealthResult } from './types/HealthComponent'
