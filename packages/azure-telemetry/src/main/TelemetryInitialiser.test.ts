import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { LoggerProvider } from '@opentelemetry/sdk-logs'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'

import { FilteringSpanProcessor } from './FilteringSpanProcessor'
import { flushTelemetry, initialiseTelemetry } from './TelemetryInitialiser'

jest.mock('@opentelemetry/sdk-trace-node', () => ({
  NodeTracerProvider: jest.fn().mockImplementation(() => ({
    register: jest.fn(),
    forceFlush: jest.fn().mockResolvedValue(undefined),
    shutdown: jest.fn().mockResolvedValue(undefined),
  })),
}))

jest.mock('@opentelemetry/sdk-trace-base', () => ({
  BatchSpanProcessor: jest.fn(),
  ConsoleSpanExporter: jest.fn(),
}))

jest.mock('@opentelemetry/instrumentation', () => ({
  registerInstrumentations: jest.fn(),
}))

jest.mock('@opentelemetry/instrumentation-bunyan', () => ({
  BunyanInstrumentation: jest.fn(),
}))

jest.mock('@opentelemetry/instrumentation-http', () => ({
  HttpInstrumentation: jest.fn(),
}))

jest.mock('@opentelemetry/instrumentation-express', () => ({
  ExpressInstrumentation: jest.fn(),
  ExpressLayerType: { MIDDLEWARE: 'middleware', ROUTER: 'router', REQUEST_HANDLER: 'request_handler' },
}))

jest.mock('@opentelemetry/resources', () => ({
  resourceFromAttributes: jest.fn(),
}))

jest.mock('@opentelemetry/semantic-conventions', () => ({
  ATTR_SERVICE_NAME: 'service.name',
  ATTR_SERVICE_VERSION: 'service.version',
}))

jest.mock('@opentelemetry/api-logs', () => ({
  logs: { setGlobalLoggerProvider: jest.fn() },
}))

jest.mock('@opentelemetry/sdk-logs', () => ({
  LoggerProvider: jest.fn().mockImplementation(() => ({
    forceFlush: jest.fn().mockResolvedValue(undefined),
    shutdown: jest.fn().mockResolvedValue(undefined),
  })),
  BatchLogRecordProcessor: jest.fn(),
  ConsoleLogRecordExporter: jest.fn(),
}))

jest.mock('@azure/monitor-opentelemetry-exporter', () => ({
  AzureMonitorTraceExporter: jest.fn(),
  AzureMonitorLogExporter: jest.fn(),
}))

jest.mock('./FilteringSpanProcessor', () => ({
  FilteringSpanProcessor: jest.fn(),
}))

const mockedNodeTracerProvider = jest.mocked(NodeTracerProvider)
const mockedFilteringSpanProcessor = jest.mocked(FilteringSpanProcessor)
const mockedRegisterInstrumentations = jest.mocked(registerInstrumentations)

describe('initialiseTelemetry()', () => {
  let consoleInfoSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
  })

  afterEach(() => {
    consoleInfoSpy.mockRestore()
  })

  it('should return a builder with chainable methods', () => {
    const builder = initialiseTelemetry({ serviceName: 'test-service' })

    expect(builder.addFilter).toBeDefined()
    expect(builder.addModifier).toBeDefined()
    expect(builder.setInstrumentations).toBeDefined()
    expect(builder.startRecording).toBeDefined()
  })

  it('should support chaining addFilter, setInstrumentations, and addModifier', () => {
    const filter = jest.fn()
    const modifier = jest.fn()

    const builder = initialiseTelemetry({ serviceName: 'test-service' })
    const result = builder.addFilter(filter).setInstrumentations([]).addModifier(modifier)

    expect(result).toBe(builder)
  })

  it('shares a provider with custom integrations without requiring an Azure exporter', async () => {
    const sampler = { shouldSample: jest.fn(), toString: () => 'custom' }
    const contextManager = {} as never
    const propagator = {} as never
    const processor = {
      onStart: jest.fn(),
      onEnd: jest.fn(),
      forceFlush: jest.fn().mockResolvedValue(undefined),
      shutdown: jest.fn().mockResolvedValue(undefined),
    }
    const afterFlush = jest.fn().mockResolvedValue(undefined)
    const builder = initialiseTelemetry({ serviceName: 'test-service' })
    expect(
      builder.withProvider({ sampler, contextManager, propagator, extraSpanProcessors: [processor], afterFlush }),
    ).toBe(builder)
    const recording = builder.startRecording()!
    expect(consoleInfoSpy).toHaveBeenCalledWith('Telemetry: Custom provider only, no Azure/debug exporters')
    expect(mockedNodeTracerProvider).toHaveBeenCalledWith(expect.objectContaining({ sampler }))
    const provider = mockedNodeTracerProvider.mock.results.at(-1)!.value
    expect(provider.register).toHaveBeenCalledWith({ contextManager, propagator })
    provider.forceFlush.mockRejectedValue(new Error('export failed'))
    const logger = jest.mocked(LoggerProvider).mock.results.at(-1)!.value
    logger.forceFlush.mockRejectedValue(new Error('log export failed'))
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    try {
      await expect(recording.shutdown()).resolves.toBeUndefined()
      expect(afterFlush).toHaveBeenCalledTimes(1)
      expect(provider.shutdown).toHaveBeenCalledTimes(1)
      expect(logger.shutdown).toHaveBeenCalledTimes(1)
    } finally {
      consoleError.mockRestore()
    }
  })

  it('flushTelemetry flushes and shuts down the owned providers without custom hooks', async () => {
    initialiseTelemetry({ serviceName: 'test-service', connectionString: 'InstrumentationKey=test' }).startRecording()
    const provider = mockedNodeTracerProvider.mock.results.at(-1)!.value
    const logger = jest.mocked(LoggerProvider).mock.results.at(-1)!.value

    await flushTelemetry()

    for (const owned of [provider, logger]) {
      expect(owned.forceFlush).toHaveBeenCalledTimes(1)
      expect(owned.shutdown).toHaveBeenCalledTimes(1)
      expect(owned.forceFlush.mock.invocationCallOrder[0]).toBeLessThan(owned.shutdown.mock.invocationCallOrder[0])
    }
    expect(consoleInfoSpy).toHaveBeenCalledWith('Telemetry: Flushing telemetry...')
    expect(consoleInfoSpy).toHaveBeenCalledWith('Telemetry: Flush complete')
  })

  it('shares one shutdown across concurrent and subsequent signal/direct calls', async () => {
    const afterFlush = jest.fn().mockResolvedValue(undefined)
    const recording = initialiseTelemetry({ serviceName: 'test-service' })
      .withProvider({ afterFlush })
      .startRecording()!
    const provider = mockedNodeTracerProvider.mock.results.at(-1)!.value
    const logger = jest.mocked(LoggerProvider).mock.results.at(-1)!.value
    const first = recording.shutdown()
    expect(recording.shutdown()).toBe(first)
    await Promise.all([first, flushTelemetry(), flushTelemetry()])
    expect(recording.shutdown()).toBe(first)
    await recording.forceFlush()
    for (const owned of [provider, logger]) {
      expect(owned.forceFlush).toHaveBeenCalledTimes(1)
      expect(owned.shutdown).toHaveBeenCalledTimes(1)
    }
    expect(afterFlush).toHaveBeenCalledTimes(1)
  })

  it('reaches shutdown within 20 seconds even when every stage stalls', async () => {
    jest.useFakeTimers()
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    try {
      const stalled = () => new Promise<void>(() => {})
      const afterFlush = jest.fn(stalled)
      const recording = initialiseTelemetry({ serviceName: 'test-service' })
        .withProvider({ afterFlush })
        .startRecording()!
      const provider = mockedNodeTracerProvider.mock.results.at(-1)!.value
      const logger = jest.mocked(LoggerProvider).mock.results.at(-1)!.value
      for (const owned of [provider, logger]) {
        owned.forceFlush.mockImplementation(stalled)
        owned.shutdown.mockImplementation(stalled)
      }
      const complete = jest.fn()
      const shutdown = flushTelemetry().then(complete)
      await jest.advanceTimersByTimeAsync(10000)
      expect(afterFlush).toHaveBeenCalledTimes(1)
      expect(provider.shutdown).not.toHaveBeenCalled()
      await jest.advanceTimersByTimeAsync(5000)
      expect(provider.shutdown).toHaveBeenCalledTimes(1)
      expect(logger.shutdown).toHaveBeenCalledTimes(1)
      expect(complete).not.toHaveBeenCalled()
      await jest.advanceTimersByTimeAsync(5000)
      await shutdown
      expect(complete).toHaveBeenCalledTimes(1)
      expect(consoleError).toHaveBeenCalledTimes(3)
      expect(jest.getTimerCount()).toBe(0)
      expect(recording.shutdown()).toBe(recording.shutdown())
    } finally {
      consoleError.mockRestore()
      jest.useRealTimers()
    }
  })

  it('decorates only library exporters and keeps configured processors separate', () => {
    const wrapExportProcessor = jest.fn(processor => processor)
    const extraSpanProcessor = { onStart: jest.fn(), onEnd: jest.fn(), forceFlush: jest.fn(), shutdown: jest.fn() }
    initialiseTelemetry({ serviceName: 'test-service', connectionString: 'InstrumentationKey=test', debug: true })
      .withProvider({ wrapExportProcessor, extraSpanProcessors: [extraSpanProcessor] })
      .startRecording()
    expect(wrapExportProcessor).toHaveBeenCalledTimes(2)
    expect(wrapExportProcessor.mock.calls.flat()).not.toContain(extraSpanProcessor)
  })

  describe('startRecording()', () => {
    it('should initialise Azure Monitor when connectionString is provided', () => {
      initialiseTelemetry({
        serviceName: 'test-service',
        connectionString: 'InstrumentationKey=test',
      }).startRecording()

      expect(mockedNodeTracerProvider).toHaveBeenCalled()
      expect(consoleInfoSpy).toHaveBeenCalledWith('Telemetry: Initialising Azure Monitor for test-service')
    })

    it('should initialise debug-only mode when debug is true and no connectionString', () => {
      initialiseTelemetry({
        serviceName: 'test-service',
        debug: true,
      }).startRecording()

      expect(mockedNodeTracerProvider).toHaveBeenCalled()
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Telemetry: Debug mode only for test-service - spans will be logged to console',
      )
    })

    it('should not initialise when no connectionString and debug is false', () => {
      initialiseTelemetry({ serviceName: 'test-service' }).startRecording()

      expect(mockedNodeTracerProvider).not.toHaveBeenCalled()
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Telemetry: No connection string and debug disabled - telemetry not initialised',
      )
    })

    it('should use default instrumentations when setInstrumentations is not called', () => {
      initialiseTelemetry({
        serviceName: 'test-service',
        connectionString: 'InstrumentationKey=test',
      }).startRecording()

      const call = mockedRegisterInstrumentations.mock.calls[0][0]
      expect(call.instrumentations).toHaveLength(3)
    })

    it('should override instrumentations when setInstrumentations is called', () => {
      const customInstrumentation = { name: 'custom' } as never

      initialiseTelemetry({
        serviceName: 'test-service',
        connectionString: 'InstrumentationKey=test',
      })
        .setInstrumentations([customInstrumentation])
        .startRecording()

      const call = mockedRegisterInstrumentations.mock.calls[0][0]
      expect(call.instrumentations).toEqual([customInstrumentation])
    })

    it('should pass filters and modifiers to FilteringSpanProcessor', () => {
      const filter = jest.fn()
      const modifier = jest.fn()

      initialiseTelemetry({
        serviceName: 'test-service',
        connectionString: 'InstrumentationKey=test',
      })
        .addFilter(filter)
        .addModifier(modifier)
        .startRecording()

      expect(mockedFilteringSpanProcessor).toHaveBeenCalledWith(expect.anything(), [filter], [modifier])
    })
  })
})
