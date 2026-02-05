import { SpanKind, SpanStatusCode } from '@opentelemetry/api'
import type { ReadableSpan, SpanProcessor } from '@opentelemetry/sdk-trace-base'

import { FilteringSpanProcessor } from './FilteringSpanProcessor'

function createMockDelegate(): jest.Mocked<SpanProcessor> {
  return {
    onStart: jest.fn(),
    onEnd: jest.fn(),
    forceFlush: jest.fn().mockResolvedValue(undefined),
    shutdown: jest.fn().mockResolvedValue(undefined),
  }
}

function createReadableSpan(overrides: Partial<ReadableSpan> = {}): ReadableSpan {
  return {
    name: 'GET',
    kind: SpanKind.SERVER,
    attributes: {},
    duration: [0, 100_000_000],
    status: { code: SpanStatusCode.OK },
    spanContext: () => ({ traceId: 'abc', spanId: '123', traceFlags: 0 }),
    startTime: [0, 0],
    endTime: [0, 100_000_000],
    ended: true,
    resource: { attributes: {} },
    instrumentationLibrary: { name: 'test' },
    links: [],
    events: [],
    parentSpanId: undefined,
    droppedAttributesCount: 0,
    droppedEventsCount: 0,
    droppedLinksCount: 0,
    ...overrides,
  } as ReadableSpan
}

function createWritableSpan(readable: ReadableSpan) {
  return {
    ...readable,
    updateName: jest.fn(),
    setAttribute: jest.fn(),
    setAttributes: jest.fn(),
    setStatus: jest.fn(),
    addEvent: jest.fn(),
    addLink: jest.fn(),
    addLinks: jest.fn(),
    end: jest.fn(),
    isRecording: jest.fn().mockReturnValue(true),
    recordException: jest.fn(),
    spanContext: readable.spanContext,
  }
}

describe('FilteringSpanProcessor', () => {
  describe('onEnd()', () => {
    it('should forward to delegate when there are no filters', () => {
      const delegate = createMockDelegate()
      const processor = new FilteringSpanProcessor(delegate)
      const span = createReadableSpan()

      processor.onEnd(span)

      expect(delegate.onEnd).toHaveBeenCalledWith(span)
    })

    it('should forward to delegate when all filters return true', () => {
      const delegate = createMockDelegate()
      const filters = [jest.fn().mockReturnValue(true), jest.fn().mockReturnValue(true)]
      const processor = new FilteringSpanProcessor(delegate, filters)
      const span = createReadableSpan()

      processor.onEnd(span)

      expect(delegate.onEnd).toHaveBeenCalledWith(span)
    })

    it('should drop the span when any filter returns false', () => {
      const delegate = createMockDelegate()
      const filters = [jest.fn().mockReturnValue(true), jest.fn().mockReturnValue(false)]
      const processor = new FilteringSpanProcessor(delegate, filters)
      const span = createReadableSpan()

      processor.onEnd(span)

      expect(delegate.onEnd).not.toHaveBeenCalled()
    })

    it('should not call remaining filters after one returns false', () => {
      const delegate = createMockDelegate()
      const secondFilter = jest.fn()
      const filters = [jest.fn().mockReturnValue(false), secondFilter]
      const processor = new FilteringSpanProcessor(delegate, filters)
      const span = createReadableSpan()

      processor.onEnd(span)

      expect(secondFilter).not.toHaveBeenCalled()
    })

    it('should provide SpanInfo with correct durationMs', () => {
      const delegate = createMockDelegate()
      const filter = jest.fn().mockReturnValue(true)
      const processor = new FilteringSpanProcessor(delegate, [filter])
      const span = createReadableSpan({ duration: [1, 500_000_000] })

      processor.onEnd(span)

      const spanInfo = filter.mock.calls[0][0]

      expect(spanInfo.durationMs).toBe(1500)
    })
  })

  describe('onEnding()', () => {
    it('should not call modifiers when there are none', () => {
      const delegate = createMockDelegate()
      const processor = new FilteringSpanProcessor(delegate)
      const readable = createReadableSpan()
      const span = createWritableSpan(readable)

      processor.onEnding(span)

      expect(span.updateName).not.toHaveBeenCalled()
    })

    it('should call each modifier with a ModifiableSpan', () => {
      const delegate = createMockDelegate()
      const modifier = jest.fn()
      const processor = new FilteringSpanProcessor(delegate, [], [modifier])
      const readable = createReadableSpan({ name: 'GET', attributes: { 'http.route': '/test' } })
      const span = createWritableSpan(readable)

      processor.onEnding(span)

      expect(modifier).toHaveBeenCalledTimes(1)

      const modifiable = modifier.mock.calls[0][0]

      expect(modifiable.name).toBe('GET')
      expect(modifiable.attributes).toEqual({ 'http.route': '/test' })
    })

    it('should delegate updateName to the underlying span', () => {
      const delegate = createMockDelegate()
      const modifier = jest.fn(span => span.updateName('POST /api'))
      const processor = new FilteringSpanProcessor(delegate, [], [modifier])
      const readable = createReadableSpan()
      const span = createWritableSpan(readable)

      processor.onEnding(span)

      expect(span.updateName).toHaveBeenCalledWith('POST /api')
    })

    it('should delegate setAttribute to the underlying span', () => {
      const delegate = createMockDelegate()
      const modifier = jest.fn(span => span.setAttribute('custom.key', 'value'))
      const processor = new FilteringSpanProcessor(delegate, [], [modifier])
      const readable = createReadableSpan()
      const span = createWritableSpan(readable)

      processor.onEnding(span)

      expect(span.setAttribute).toHaveBeenCalledWith('custom.key', 'value')
    })
  })

  describe('forceFlush()', () => {
    it('should delegate to the wrapped processor', async () => {
      const delegate = createMockDelegate()
      const processor = new FilteringSpanProcessor(delegate)
      await processor.forceFlush()

      expect(delegate.forceFlush).toHaveBeenCalled()
    })
  })

  describe('shutdown()', () => {
    it('should delegate to the wrapped processor', async () => {
      const delegate = createMockDelegate()
      const processor = new FilteringSpanProcessor(delegate)
      await processor.shutdown()

      expect(delegate.shutdown).toHaveBeenCalled()
    })
  })
})
