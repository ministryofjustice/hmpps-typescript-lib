import { context } from '@opentelemetry/api'
import { getRPCMetadata } from '@opentelemetry/core'
import { LogHookFunction } from '@opentelemetry/instrumentation-bunyan'
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base'
import { AI_OPERATION_NAME } from '@azure/monitor-opentelemetry-exporter'

/**
 * Log hook that populates the operation name in log records from HTTP spans.
 *
 * Extracts the HTTP method from span attributes and the route template from RPC metadata,
 * then sets the operation name to `${method} ${route}` (e.g., "GET /users/:id").
 */
export const populateOperationNameLogHook: LogHookFunction = (span, record) => {
  const readableSpan = span as unknown as ReadableSpan

  const method = readableSpan.attributes?.['http.request.method'] ?? readableSpan.attributes?.['http.method']
  const route = getRPCMetadata(context.active())?.route

  if (method && route) {
    Object.assign(record, { [AI_OPERATION_NAME]: `${method} ${route}` })
  }
}
