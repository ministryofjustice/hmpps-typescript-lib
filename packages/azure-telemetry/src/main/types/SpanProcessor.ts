import type { AttributeValue, Attributes, SpanKind, SpanStatus } from '@opentelemetry/api'

/**
 * Information about a span, provided to filter functions.
 * Read-only view of the span for deciding whether to keep or drop it.
 */
export interface SpanInfo {
  /** The span name (operation name) */
  readonly name: string

  /** The kind of span: CLIENT, SERVER, INTERNAL, PRODUCER, CONSUMER */
  readonly kind: SpanKind

  /** Span attributes (tags/dimensions) */
  readonly attributes: Attributes

  /** Span duration in milliseconds */
  readonly durationMs: number

  /** Span status */
  readonly status: SpanStatus
}

/**
 * A span that can be both read and modified, provided to modifier functions.
 * Wraps the OpenTelemetry Span to expose a clean read/write interface.
 */
export interface ModifiableSpan {
  /** The span name (operation name) */
  readonly name: string

  /** The kind of span: CLIENT, SERVER, INTERNAL, PRODUCER, CONSUMER */
  readonly kind: SpanKind

  /** Span attributes (tags/dimensions) */
  readonly attributes: Attributes

  /** Update the span name */
  updateName(name: string): void

  /** Set a single attribute on the span */
  setAttribute(key: string, value: AttributeValue): void
}

/**
 * Filter function that decides whether to keep or drop a span.
 * Return true to keep the span, false to drop it.
 */
export type SpanFilterFn = (span: SpanInfo) => boolean

/**
 * Modifier function that reads and writes span data directly.
 */
export type SpanModifierFn = (span: ModifiableSpan) => void
