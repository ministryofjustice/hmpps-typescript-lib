/* eslint-disable no-console */

import { NodeSDK } from '@opentelemetry/sdk-node'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { getNodeAutoInstrumentations, InstrumentationConfigMap } from '@opentelemetry/auto-instrumentations-node'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { Resource } from '@opentelemetry/resources'
import { SeverityNumber } from '@opentelemetry/api-logs'

import { AzureMonitorMetricExporter, AzureMonitorTraceExporter } from '@azure/monitor-opentelemetry-exporter'

import process from 'process'
import type { AzureMonitoringOptions } from './types/AzureMonitoringOptions'

const defaultInstrumentationOptions: InstrumentationConfigMap = {
  '@opentelemetry/instrumentation-bunyan': { logSeverity: SeverityNumber.INFO },
}

const setUpAzureMonitor = ({ applicationInfo, instrumentationOptions = {} }: AzureMonitoringOptions) => {
  const exporter = new AzureMonitorTraceExporter()

  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: applicationInfo.applicationName,
      [ATTR_SERVICE_VERSION]: applicationInfo.buildNumber,
    }),
    traceExporter: exporter,
    metricReader: new PeriodicExportingMetricReader({
      exporter: new AzureMonitorMetricExporter(),
    }),
    instrumentations: [getNodeAutoInstrumentations({ ...defaultInstrumentationOptions, ...instrumentationOptions })],
    spanProcessors: [
      new BatchSpanProcessor(exporter, {
        /** The maximum queue size. After the size is reached spans are dropped. */
        maxQueueSize: 4096,
      }),
    ],
  })

  sdk.start()

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(
        () => console.log('SDK shut down successfully'),
        err => console.log('Error shutting down SDK', err),
      )
      .finally(() => process.exit(0))
  })
}

export function initAzureMonitoring(options: AzureMonitoringOptions) {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    console.info('Setting up azure monitoring')
    setUpAzureMonitor(options)
  } else {
    console.warn('azure monitoring not enabled')
  }
}
