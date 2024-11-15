import { HealthComponent } from './types/HealthComponent'
import { HealthCheckResult } from './types/MonitoringOptions'

export default class HealthCheck {
  constructor(private readonly healthComponents: HealthComponent[]) {}

  /** Run and return component health checks */
  async check(): Promise<HealthCheckResult> {
    const enabledComponents = this.healthComponents.filter(component => component.isEnabled())

    if (enabledComponents.length) {
      const componentHealthResults = await Promise.all(enabledComponents.map(component => component.health()))
      const formattedResults = Object.fromEntries(componentHealthResults.map(({ name, ...rest }) => [name, rest]))

      return {
        status: componentHealthResults.some(component => component.status === 'DOWN') ? 'DOWN' : 'UP',
        components: formattedResults,
      }
    }

    return {
      status: 'UP',
    }
  }
}
