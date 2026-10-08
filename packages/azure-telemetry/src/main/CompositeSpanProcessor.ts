import type { Context } from '@opentelemetry/api'
import type { ReadableSpan, Span, SpanProcessor } from '@opentelemetry/sdk-trace-base'

/** Fan out after common filters/modifiers, preserving each processor's lifecycle. */
export class CompositeSpanProcessor implements SpanProcessor {
  constructor(private readonly processors: SpanProcessor[]) {}

  onStart(span: Span, context: Context) {
    this.processors.forEach(processor => processor.onStart(span, context))
  }

  onEnding(span: Span) {
    this.processors.forEach(processor => processor.onEnding?.(span))
  }

  onEnd(span: ReadableSpan) {
    this.processors.forEach(processor => processor.onEnd(span))
  }

  async forceFlush() {
    await Promise.all(this.processors.map(async processor => processor.forceFlush()))
  }

  async shutdown() {
    await Promise.all(this.processors.map(async processor => processor.shutdown()))
  }
}
