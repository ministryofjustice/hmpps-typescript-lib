import type { Attributes } from '@opentelemetry/api'

/**
 * Get a string attribute from a span, checking multiple possible keys.
 */
export function getStringAttribute(span: { attributes: Attributes }, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = span.attributes[key]

    if (typeof value === 'string') {
      return value
    }
  }

  return undefined
}
