import type { AzureMonitorExporterOptions } from '@azure/monitor-opentelemetry-exporter'

export type ExporterClientOptions = Omit<
  AzureMonitorExporterOptions,
  'connectionString' | 'apiVersion' | 'credential' | 'storageDirectory' | 'disableOfflineStorage'
>

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

  /**
   * Optional Azure client/pipeline options (for example proxyOptions/httpClient)
   * forwarded to Azure Monitor exporters.
   */
  exporterClientOptions?: ExporterClientOptions
}
