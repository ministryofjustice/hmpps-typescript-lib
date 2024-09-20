/**
 * Represents a component whose health can be monitored.
 * This interface defines the base for any health component that can
 * have its health checked.
 */
export interface HealthComponent {
  /**
   * Determines whether the health check for this component is enabled.
   * This method allows dynamic enabling or disabling of health checks
   * for specific components based on configuration or runtime conditions.
   *
   * @returns {boolean} `true` if the health check is enabled; otherwise, `false`.
   */
  isEnabled: () => boolean

  /**
   * Performs a health check for the component.
   * This asynchronous method should contain the logic necessary to assess
   * the health status of the component.
   *
   * @returns {Promise<ComponentHealthResult>} A promise that resolves to the health check result.
   *
   * @throws Will throw an error if the health check fails unexpectedly.
   *
   * @example
   *   async health(): Promise<ComponentCheckResult> {
   *     const isCacheAvailable = await this.checkCacheConnection();
   *     return {
   *       status: isCacheAvailable ? 'UP' : 'DOWN',
   *       details: {
   *         cacheService: 'Redis',
   *       },
   *     };
   *   }
   *
   *   private async checkCacheConnection(): Promise<boolean> {
   *     // Logic to check cache connectivity
   *   }
   */
  health: () => Promise<ComponentHealthResult>
}

/**
 * Represents the result of a health check for a component.
 */
export interface ComponentHealthResult {
  /** The name of the component. */
  name: string
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
