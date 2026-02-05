/**
 * Configuration for telemetry initialisation.
 */
export interface TelemetryConfig {
  /** Service name reported in telemetry */
  serviceName: string

  /** Service version (e.g., build number) */
  serviceVersion?: string

  /** Azure Application Insights connection string. */
  connectionString?: string

  /** Enable debug mode - logs spans to console. */
  debug?: boolean
}
