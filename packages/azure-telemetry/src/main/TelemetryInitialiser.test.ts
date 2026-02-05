import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'

import { FilteringSpanProcessor } from './FilteringSpanProcessor'
import { initialiseTelemetry } from './TelemetryInitialiser'

jest.mock('@opentelemetry/sdk-trace-node', () => ({
  NodeTracerProvider: jest.fn().mockImplementation(() => ({
    register: jest.fn(),
  })),
}))

jest.mock('@opentelemetry/sdk-trace-base', () => ({
  BatchSpanProcessor: jest.fn(),
  ConsoleSpanExporter: jest.fn(),
}))

jest.mock('@opentelemetry/instrumentation', () => ({
  registerInstrumentations: jest.fn(),
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

jest.mock('@azure/monitor-opentelemetry-exporter', () => ({
  AzureMonitorTraceExporter: jest.fn(),
}))

jest.mock('./FilteringSpanProcessor', () => ({
  FilteringSpanProcessor: jest.fn(),
}))

const mockedNodeTracerProvider = jest.mocked(NodeTracerProvider)
const mockedFilteringSpanProcessor = jest.mocked(FilteringSpanProcessor)

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
    expect(builder.startRecording).toBeDefined()
  })

  it('should support chaining addFilter and addModifier', () => {
    const filter = jest.fn()
    const modifier = jest.fn()

    const builder = initialiseTelemetry({ serviceName: 'test-service' })
    const result = builder.addFilter(filter).addModifier(modifier)

    expect(result).toBe(builder)
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
