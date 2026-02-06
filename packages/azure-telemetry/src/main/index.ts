import { telemetry as baseTelemetry } from './client'
import { enrichSpanWithUser } from './helpers/enrichSpanWithUser'
import { filterSpanWhereClient } from './processors/filterSpanWhereClient'
import { filterSpanWherePath } from './processors/filterSpanWherePath'
import { modifySpanNameWithHttpRoute } from './processors/modifySpanNameWithHttpRoute'
import { modifySpanWithObfuscation } from './processors/modifySpanWithObfuscation'

/** Export types */
export { initialiseTelemetry, flushTelemetry, defaultInstrumentations, trace } from './TelemetryInitialiser'
export type { TelemetryBuilder } from './TelemetryInitialiser'
export type { SpanInfo, ModifiableSpan, SpanFilterFn, SpanModifierFn } from './types/SpanProcessor'
export type { TelemetryConfig } from './types/TelemetryConfig'
export type { UserContext } from './types/UserContext'
export type { ObfuscationRule, ObfuscatorConfig } from './types/ObfuscatorConfig'
export { SpanKind } from '@opentelemetry/api'
export type { Instrumentation } from '@opentelemetry/instrumentation'

/**
 * Telemetry library for Azure Application Insights with OpenTelemetry.
 *
 * IMPORTANT: Import this module FIRST before any other modules in your entry point.
 * OpenTelemetry needs to instrument modules (express, http, etc.) before they're loaded.
 *
 * @example
 * // In server.ts (must be first import)
 * import { initialiseTelemetry, flushTelemetry, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
 *
 * initialiseTelemetry({
 *   serviceName: 'my-service',
 *   serviceVersion: process.env.BUILD_NUMBER,
 *   connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
 * })
 *   .addFilter(telemetry.processors.filterSpanWhereClient())
 *   .addFilter(telemetry.processors.filterSpanWherePath(['/health', '/ping']))
 *   .addModifier(telemetry.processors.modifySpanNameWithHttpRoute())
 *   .startRecording()
 *
 * // Handle shutdown
 * process.on('SIGTERM', async () => {
 *   await flushTelemetry()
 *   process.exit(0)
 * })
 *
 * // Then other imports...
 * import express from 'express'
 *
 * // Use telemetry anywhere in your code
 * import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
 *
 * telemetry.setSpanAttributes({ 'custom.attribute': 'value' })
 * telemetry.addSpanEvent('UserLoggedIn', { userId })
 * telemetry.helpers.enrichSpanWithUser({ id: userId, authSource: 'nomis' })
 */
export const telemetry = {
  ...baseTelemetry,
  processors: {
    filterSpanWhereClient,
    filterSpanWherePath,
    enrichSpanNameWithHttpRoute: modifySpanNameWithHttpRoute,
    enrichSpanWithObfuscation: modifySpanWithObfuscation,
  },
  helpers: {
    enrichSpanWithUser,
  },
}
