import type { SpanModifierFn } from '../types/SpanProcessor'
import { getStringAttribute } from '../utils/getStringAttribute'

/**
 * Creates a modifier that renames HTTP spans to use the route pattern.
 * Changes "GET" to "GET /users/:id" for better operation names.
 *
 * @example
 * initialiseTelemetry(config)
 *   .addModifier(telemetry.helpers.modifySpanNameWithHttpRoute())
 *   .startRecording()
 */
export function modifySpanNameWithHttpRoute(): SpanModifierFn {
  return span => {
    const method = getStringAttribute(span, 'http.request.method', 'http.method')
    const route = getStringAttribute(span, 'http.route')

    if (method && route) {
      span.updateName(`${method} ${route}`)
    }
  }
}
