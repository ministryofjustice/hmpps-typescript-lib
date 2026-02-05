import { trace, SpanStatusCode, Span } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'

import { getConfig } from './config'

function getTracer() {
  const config = getConfig()

  return trace.getTracer(config?.serviceName ?? 'hmpps-azure-telemetry')
}

function getLogger() {
  const config = getConfig()

  return logs.getLogger(config?.serviceName ?? 'hmpps-azure-telemetry')
}

/**
 * Telemetry client for custom spans and events.
 *
 * @example
 * import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
 *
 * // Track a custom event
 * telemetry.trackEvent('UserLoggedIn', { userId: '123' })
 *
 * // Wrap an operation in a span
 * await telemetry.withSpan('processPayment', async (span) => {
 *   span.setAttribute('amount', 100)
 *   await chargeCard()
 * })
 */
export const telemetry = {
  /**
   * Set attributes on the current active span.
   *
   * @param attributes - Attributes to set
   */
  setSpanAttributes(attributes: Record<string, string | number | boolean>): void {
    const span = trace.getActiveSpan()

    if (span) {
      for (const [key, value] of Object.entries(attributes)) {
        span.setAttribute(key, value)
      }
    }
  },

  /**
   * Wrap an operation in a span with automatic error handling.
   *
   * @param name - Span name
   * @param fn - Function to execute within the span
   * @returns The result of the function
   *
   * @example
   * const result = await telemetry.withSpan('processPayment', async (span) => {
   *   span.setAttribute('orderId', '123')
   *   return await processPayment()
   * })
   */
  async withSpan<T>(name: string, fn: (span: Span) => Promise<T>): Promise<T> {
    const tracer = getTracer()
    const span = tracer.startSpan(name)

    try {
      const result = await fn(span)
      span.setStatus({ code: SpanStatusCode.OK })

      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      })

      throw error
    } finally {
      span.end()
    }
  },

  /**
   * Track a custom event in Application Insights (appears in the customEvents table).
   *
   * @param name - Event name
   * @param attributes - Optional attributes to attach
   */
  trackEvent(name: string, attributes?: Record<string, string | number | boolean>): void {
    const logger = getLogger()

    logger.emit({
      severityNumber: SeverityNumber.INFO,
      attributes: {
        'microsoft.custom_event.name': name,
        ...attributes,
      },
    })
  },

  /**
   * Wrap a synchronous operation in a span with automatic error handling.
   *
   * @param name - Span name
   * @param fn - Function to execute within the span
   * @returns The result of the function
   */
  withSpanSync<T>(name: string, fn: (span: Span) => T): T {
    const tracer = getTracer()
    const span = tracer.startSpan(name)

    try {
      const result = fn(span)
      span.setStatus({ code: SpanStatusCode.OK })

      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      })

      throw error
    } finally {
      span.end()
    }
  },
}
