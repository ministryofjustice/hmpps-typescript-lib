import type { Context, Span } from '@opentelemetry/api'
import type { ReadableSpan, SpanProcessor } from '@opentelemetry/sdk-trace-base'

import type { ModifiableSpan, SpanFilterFn, SpanInfo, SpanModifierFn } from './types/SpanProcessor'

/**
 * Custom SpanProcessor that wraps another processor and allows
 * filtering and modification of spans before export.
 *
 * This processor:
 * 1. Runs modifiers in onEnding — where the span is still writable
 * 2. Runs filters in onEnd — if any returns false, the span is dropped
 * 3. Forwards to the delegate processor
 */
export class FilteringSpanProcessor implements SpanProcessor {
  private readonly delegate: SpanProcessor

  private readonly filters: SpanFilterFn[]

  private readonly modifiers: SpanModifierFn[]

  constructor(delegate: SpanProcessor, filters: SpanFilterFn[] = [], modifiers: SpanModifierFn[] = []) {
    this.delegate = delegate
    this.filters = filters
    this.modifiers = modifiers
  }

  forceFlush(): Promise<void> {
    return this.delegate.forceFlush()
  }

  shutdown(): Promise<void> {
    return this.delegate.shutdown()
  }

  onStart(_span: Span, _parentContext: Context): void {
    // No-op — modifications happen in onEnding, filtering in onEnd
  }

  onEnding(span: Span): void {
    if (this.modifiers.length === 0) {
      return
    }

    const modifiable = this.toModifiableSpan(span)

    for (const modifier of this.modifiers) {
      modifier(modifiable)
    }
  }

  onEnd(span: ReadableSpan): void {
    if (this.filters.length === 0) {
      this.delegate.onEnd(span)

      return
    }

    const spanInfo = this.toSpanInfo(span)

    for (const filter of this.filters) {
      if (!filter(spanInfo)) {
        return
      }
    }

    this.delegate.onEnd(span)
  }

  private toModifiableSpan(span: Span): ModifiableSpan {
    const readable = span as unknown as ReadableSpan

    return {
      get name() {
        return readable.name
      },
      get kind() {
        return readable.kind
      },
      get attributes() {
        return readable.attributes
      },
      updateName: name => span.updateName(name),
      setAttribute: (key, value) => span.setAttribute(key, value),
    }
  }

  private toSpanInfo(span: ReadableSpan): SpanInfo {
    const durationNanos = span.duration[0] * 1e9 + span.duration[1]
    const durationMs = durationNanos / 1e6

    return {
      name: span.name,
      kind: span.kind,
      attributes: span.attributes,
      durationMs,
      status: span.status,
    }
  }
}
