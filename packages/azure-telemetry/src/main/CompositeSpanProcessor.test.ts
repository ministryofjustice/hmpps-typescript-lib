import { ROOT_CONTEXT } from '@opentelemetry/api'
import type { ReadableSpan, Span } from '@opentelemetry/sdk-trace-base'
import { CompositeSpanProcessor } from './CompositeSpanProcessor'
import { FilteringSpanProcessor } from './FilteringSpanProcessor'

const delegate = () => ({
  onStart: jest.fn(),
  onEnd: jest.fn(),
  forceFlush: jest.fn().mockResolvedValue(undefined),
  shutdown: jest.fn().mockResolvedValue(undefined),
})

describe('shared processor lifecycle', () => {
  it('applies common modifiers once and filters all exporters, forwarding start context', () => {
    const azure = delegate()
    const extra = delegate()
    const modifier = jest.fn()
    const filter = jest.fn().mockReturnValue(false)
    const processor = new FilteringSpanProcessor(new CompositeSpanProcessor([azure, extra]), [filter], [modifier])
    const span = { name: 'test', attributes: {}, kind: 1, duration: [0, 1], status: { code: 0 } } as Span
    processor.onStart(span, ROOT_CONTEXT)
    processor.onEnding(span)
    processor.onEnd(span as ReadableSpan)
    expect(modifier).toHaveBeenCalledTimes(1)
    expect(azure.onStart).toHaveBeenCalledWith(span, ROOT_CONTEXT)
    expect(extra.onStart).toHaveBeenCalledWith(span, ROOT_CONTEXT)
    expect(azure.onEnd).not.toHaveBeenCalled()
    expect(extra.onEnd).not.toHaveBeenCalled()
  })

  it('attempts every processor flush even if the first throws synchronously', async () => {
    const azure = delegate()
    const extra = delegate()
    azure.forceFlush.mockImplementation(() => {
      throw new Error('unavailable')
    })
    await expect(new CompositeSpanProcessor([azure, extra]).forceFlush()).rejects.toThrow('unavailable')
    expect(extra.forceFlush).toHaveBeenCalledTimes(1)
  })
})
