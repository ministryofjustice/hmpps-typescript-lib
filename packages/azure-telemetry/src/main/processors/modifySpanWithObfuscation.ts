import crypto from 'crypto'

import type { SpanModifierFn } from '../types/SpanProcessor'
import type { ObfuscatorConfig } from '../types/ObfuscatorConfig'

function hash(value: string, key: string): string {
  return crypto.createHmac('sha256', key).update(value).digest('hex').slice(0, 16)
}

/**
 * Creates a modifier that obfuscates sensitive data in span attributes.
 * Uses HMAC-SHA256 with a key so the same input always produces the same hash.
 *
 * @param config - Obfuscation configuration
 * @returns A SpanModifierFn that obfuscates matching attributes
 *
 * @example
 * initialiseTelemetry(config)
 *   .addModifier(telemetry.helpers.modifySpanWithObfuscation({
 *     key: process.env.OBFUSCATION_KEY,
 *     rules: [
 *       { attribute: 'http.url', pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi },
 *       { attribute: 'enduser.id' },
 *     ],
 *   }))
 *   .startRecording()
 */
export function modifySpanWithObfuscation(config: ObfuscatorConfig): SpanModifierFn {
  return span => {
    config.rules.forEach(rule => {
      const value = span.attributes[rule.attribute]

      if (typeof value === 'string') {
        if (rule.pattern) {
          span.setAttribute(
            rule.attribute,
            value.replace(rule.pattern, match => hash(match, config.key)),
          )
        } else {
          span.setAttribute(rule.attribute, hash(value, config.key))
        }
      }
    })
  }
}
