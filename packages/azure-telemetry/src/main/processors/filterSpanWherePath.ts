import { SpanStatusCode } from '@opentelemetry/api'
import type { SpanFilterFn } from '../types/SpanProcessor'
import { getStringAttribute } from '../utils/getStringAttribute'
import { getConfig } from '../config'

/**
 * Creates a filter that drops requests to specified paths.
 *
 * @param paths - Paths to filter. Supports exact matches and prefix matches (ending with *)
 * @returns A SpanFilterFn that returns false for matching spans
 *
 * @example
 * initialiseTelemetry(config)
 *   .addFilter(telemetry.helpers.filterSpanWherePath(['/health', '/ping', '/assets/*']))
 *   .startRecording()
 */
export function filterSpanWherePath(paths: string[]): SpanFilterFn {
  return span => {
    const includeFilteredPathsWithErrors = getConfig()?.includeFilteredPathsWithErrors ?? true

    const url = getStringAttribute(span, 'url.path', 'http.target') ?? ''

    const isMatchingPath = paths.some(pattern => {
      if (pattern.endsWith('*')) {
        return url.startsWith(pattern.slice(0, -1))
      }

      return url === pattern
    })

    return !isMatchingPath || (includeFilteredPathsWithErrors && span.status?.code === SpanStatusCode.ERROR)
  }
}
