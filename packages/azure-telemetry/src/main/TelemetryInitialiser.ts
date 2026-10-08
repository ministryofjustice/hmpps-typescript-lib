import { metrics, trace } from '@opentelemetry/api'
import type { ContextManager, TextMapPropagator } from '@opentelemetry/api'

import { logs } from '@opentelemetry/api-logs'
import { type Instrumentation, registerInstrumentations } from '@opentelemetry/instrumentation'
import { BunyanInstrumentation } from '@opentelemetry/instrumentation-bunyan'
import { ExpressInstrumentation, ExpressLayerType } from '@opentelemetry/instrumentation-express'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor, ConsoleLogRecordExporter, LoggerProvider } from '@opentelemetry/sdk-logs'
import type { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs'
import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base'
import type { Sampler, SpanProcessor } from '@opentelemetry/sdk-trace-base'

import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { AzureMonitorLogExporter, AzureMonitorTraceExporter } from '@azure/monitor-opentelemetry-exporter'
import type { TelemetryConfig } from './types/TelemetryConfig'
import type { SpanFilterFn, SpanModifierFn } from './types/SpanProcessor'
import { CompositeSpanProcessor } from './CompositeSpanProcessor'
import { FilteringSpanProcessor } from './FilteringSpanProcessor'
import { populateOperationNameLogHook } from './populateOperationNameLogHook'
import { setConfig } from './config'

export const defaultInstrumentations: Instrumentation[] = [
  new BunyanInstrumentation({ disableLogSending: false, logHook: populateOperationNameLogHook }),
  new HttpInstrumentation(),
  new ExpressInstrumentation({
    ignoreLayersType: [ExpressLayerType.MIDDLEWARE, ExpressLayerType.ROUTER, ExpressLayerType.REQUEST_HANDLER],
  }),
]

export interface TelemetryBuilder {
  addFilter(filter: SpanFilterFn): TelemetryBuilder
  addModifier(modifier: SpanModifierFn): TelemetryBuilder
  setInstrumentations(instrumentations: Instrumentation[]): TelemetryBuilder
  withProvider(options: TelemetryProviderOptions): TelemetryBuilder
  startRecording(): TelemetryHandle | undefined
}

/** Optional integration hooks; Azure exporters, resources and logging stay library-owned. */
export interface TelemetryProviderOptions {
  sampler?: Sampler
  propagator?: TextMapPropagator
  contextManager?: ContextManager
  extraSpanProcessors?: SpanProcessor[]
  /** Decorate each Azure/debug processor, e.g. adapt an export copy for another sampler. */
  wrapExportProcessor?: (processor: SpanProcessor) => SpanProcessor
  /** Run after all processors flush, before shutdown (e.g. flush an SDK transport). */
  afterFlush?: () => Promise<unknown>
}

export interface TelemetryHandle {
  forceFlush(): Promise<void>
  shutdown(): Promise<void>
}

let activeTelemetry: TelemetryHandle | undefined

/**
 * Flush pending telemetry and shut down the provider.
 * Call this during application shutdown to ensure all telemetry is sent.
 */
export async function flushTelemetry(): Promise<void> {
  if (activeTelemetry) {
    await activeTelemetry.shutdown()
    return
  }
  console.info('Telemetry: Flushing telemetry...')

  try {
    const traceProvider = trace.getTracerProvider()

    if ('forceFlush' in traceProvider && typeof traceProvider.forceFlush === 'function') {
      await traceProvider.forceFlush()
    }

    if ('shutdown' in traceProvider && typeof traceProvider.shutdown === 'function') {
      await traceProvider.shutdown()
    }

    const logProvider = logs.getLoggerProvider()

    if ('forceFlush' in logProvider && typeof logProvider.forceFlush === 'function') {
      await logProvider.forceFlush()
    }

    if ('shutdown' in logProvider && typeof logProvider.shutdown === 'function') {
      await logProvider.shutdown()
    }

    console.info('Telemetry: Flush complete')
  } catch (error) {
    console.error('Telemetry: Error during flush', error)
  }
}

function createCompatibleAzureLogExporter(connectionString: string): LogRecordExporter {
  const exporter = new AzureMonitorLogExporter({ connectionString })

  return {
    export(logRecords: ReadableLogRecord[], resultCallback) {
      return exporter.export(logRecords, resultCallback)
    },
    shutdown() {
      return exporter.shutdown()
    },
    forceFlush() {
      if ('forceFlush' in exporter && typeof exporter.forceFlush === 'function') {
        return exporter.forceFlush()
      }

      return Promise.resolve()
    },
  }
}

function startTelemetry(
  config: TelemetryConfig,
  filters: SpanFilterFn[],
  modifiers: SpanModifierFn[],
  instrumentations: Instrumentation[],
  options: TelemetryProviderOptions,
): TelemetryHandle {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: config.serviceName,
    [ATTR_SERVICE_VERSION]: config.serviceVersion || 'unknown',
  })
  const spanProcessors: SpanProcessor[] = []
  const logProcessors: BatchLogRecordProcessor[] = []
  const addExporter = (processor: SpanProcessor) => {
    spanProcessors.push(options.wrapExportProcessor ? options.wrapExportProcessor(processor) : processor)
  }
  if (config.connectionString) {
    console.info(`Telemetry: Initialising Azure Monitor for ${config.serviceName}`)
    addExporter(new BatchSpanProcessor(new AzureMonitorTraceExporter({ connectionString: config.connectionString })))
    logProcessors.push(new BatchLogRecordProcessor(createCompatibleAzureLogExporter(config.connectionString)))
  } else if (config.debug) {
    console.info(`Telemetry: Debug mode only for ${config.serviceName} - spans will be logged to console`)
  }
  if (config.debug) {
    addExporter(new BatchSpanProcessor(new ConsoleSpanExporter()))
    logProcessors.push(new BatchLogRecordProcessor(new ConsoleLogRecordExporter()))
  }
  spanProcessors.push(...(options.extraSpanProcessors || []))
  const provider = new NodeTracerProvider({
    resource,
    ...(options.sampler ? { sampler: options.sampler } : {}),
    spanProcessors: [new FilteringSpanProcessor(new CompositeSpanProcessor(spanProcessors), filters, modifiers)],
  })
  provider.register({
    ...(options.contextManager ? { contextManager: options.contextManager } : {}),
    ...(options.propagator ? { propagator: options.propagator } : {}),
  })
  const loggerProvider = new LoggerProvider({ resource, processors: logProcessors })
  logs.setGlobalLoggerProvider(loggerProvider)
  registerInstrumentations({
    tracerProvider: provider,
    meterProvider: metrics.getMeterProvider(),
    loggerProvider,
    instrumentations,
  })
  const flush = async () => {
    await settle([() => provider.forceFlush(), () => loggerProvider.forceFlush()])
    if (options.afterFlush) await settle([options.afterFlush])
  }
  return {
    forceFlush: flush,
    shutdown: async () => {
      await flush()
      await settle([() => provider.shutdown(), () => loggerProvider.shutdown()])
    },
  }
}

async function settle(actions: (() => Promise<unknown>)[]) {
  const results = await Promise.allSettled(actions.map(async action => action()))
  results.forEach(result => {
    if (result.status === 'rejected') console.error('Telemetry: Error during flush/shutdown', result.reason)
  })
}

/**
 * Initialise telemetry for the application.
 *
 * IMPORTANT: Call this at the very top of your entry point, before any other imports.
 *
 * @param config - Telemetry configuration
 * @returns A builder to configure span processors and start recording
 *
 * @example
 * initialiseTelemetry({
 *   serviceName: 'my-service',
 *   serviceVersion: process.env.BUILD_NUMBER,
 *   connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
 * })
 *   .addFilter(processors.filterSpanWhereClient())
 *   .addFilter(processors.filterSpanWherePath(['/health', '/ping']))
 *   .addModifier(processors.modifySpanNameWithHttpRoute())
 *   .startRecording()
 */
export function initialiseTelemetry(config: TelemetryConfig): TelemetryBuilder {
  setConfig(config)

  const filters: SpanFilterFn[] = []
  const modifiers: SpanModifierFn[] = []
  let instrumentations: Instrumentation[] = defaultInstrumentations
  let providerOptions: TelemetryProviderOptions | undefined

  return {
    addFilter(filter: SpanFilterFn): TelemetryBuilder {
      filters.push(filter)

      return this
    },

    addModifier(modifier: SpanModifierFn): TelemetryBuilder {
      modifiers.push(modifier)

      return this
    },

    setInstrumentations(custom: Instrumentation[]): TelemetryBuilder {
      instrumentations = custom

      return this
    },

    withProvider(options: TelemetryProviderOptions): TelemetryBuilder {
      providerOptions = options
      return this
    },

    startRecording(): TelemetryHandle | undefined {
      if (config.connectionString || config.debug || providerOptions) {
        activeTelemetry = startTelemetry(config, filters, modifiers, instrumentations, providerOptions || {})
        return activeTelemetry
      }
      console.info('Telemetry: No connection string and debug disabled - telemetry not initialised')
      return undefined
    },
  }
}

export { trace }
