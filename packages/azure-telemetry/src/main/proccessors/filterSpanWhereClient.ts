import { SpanKind } from '@opentelemetry/api'

import type { SpanFilterFn } from '../types/SpanProcessor'

/**
 * Creates a filter that drops outgoing HTTP calls (CLIENT spans).
 * Trace context is still propagated to downstream services.
 *
 * @example
 * initialiseTelemetry(config)
 *   .addFilter(telemetry.helpers.filterSpanWhereClient())
 *   .startRecording()
 */
export function filterSpanWhereClient(): SpanFilterFn {
  return span => span.kind !== SpanKind.CLIENT
}
