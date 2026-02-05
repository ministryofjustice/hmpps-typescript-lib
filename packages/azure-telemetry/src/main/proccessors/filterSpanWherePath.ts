import type { SpanFilterFn } from '../types/SpanProcessor'
import { getStringAttribute } from '../utils/getStringAttribute'

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
    const url = getStringAttribute(span, 'url.path', 'http.target') ?? ''

    return !paths.some(pattern => {
      if (pattern.endsWith('*')) {
        return url.startsWith(pattern.slice(0, -1))
      }

      return url === pattern
    })
  }
}
