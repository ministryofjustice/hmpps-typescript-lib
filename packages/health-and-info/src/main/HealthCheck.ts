import { HealthComponent } from './types/HealthComponent'
import { HealthCheckResult } from './types/HealthCheckOptions'

export default class HealthCheck {
  constructor(private readonly healthComponents: HealthComponent[]) {}

  /** Run and return component health checks */
  async check(): Promise<HealthCheckResult> {
    const components = this.healthComponents.filter(component => component.isEnabled())

    if (components.length) {
      const componentHealthResults = await Promise.all(components.map(component => component.health()))

      return {
        status: componentHealthResults.some(component => component.status === 'DOWN') ? 'DOWN' : 'UP',
        components: componentHealthResults,
      }
    }

    return {
      status: 'UP',
    }
  }
}
