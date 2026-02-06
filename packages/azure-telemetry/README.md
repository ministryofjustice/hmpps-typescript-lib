# @ministryofjustice/hmpps-azure-telemetry

A shared telemetry package that wraps OpenTelemetry and Azure Application Insights.
Offers a few useful processors and helpers by default.

## Status

**This library is currently: alpha.**

Please provide feedback via slack to the #typescript channel.

## Setup

**Important:** This must be imported at the very top of your entry point, before any other imports.
OpenTelemetry needs to instrument modules (express, http, etc.) before they're loaded.

```ts
// server/utils/azureAppInsights.ts
import { initialiseTelemetry, flushTelemetry, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'

initialiseTelemetry({
  serviceName: 'my-service',
  serviceVersion: process.env.BUILD_NUMBER,
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  debug: process.env.DEBUG_TELEMETRY // Log telemetry to the console for debugging/developing
})
  .addFilter(telemetry.processors.filterSpanWhereClient())
  .addFilter(telemetry.processors.filterSpanWherePath(['/health', '/ping', '/assets/*']))
  .addModifier(telemetry.processors.modifySpanNameWithHttpRoute())
  .startRecording()

// Then other imports...
import express from 'express'

// Graceful shutdown
process.on('SIGTERM', async () => {
  await flushTelemetry()
  process.exit(0)
})
```

```ts
// server.ts
// Import before any of the other modules are loaded.
import './server/utils/azureAppInsights'
import app from './server/index'
import logger from './logger'
```

## Usage

### Custom events and spans

```ts
import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'

// Set attributes on the current span
telemetry.setSpanAttributes({ 'custom.key': 'value' })

// Add events
telemetry.trackEvent('UserLoggedIn', { userId: '123' })

// Wrap operations in spans
await telemetry.withSpan('processPayment', async (span) => {
  span.setAttribute('orderId', '123')
  return await processPayment()
})
```

### Custom processors

You can write your own filters and modifiers:

```ts
import type { SpanFilterFn, SpanModifierFn } from '@ministryofjustice/hmpps-azure-telemetry'

// Filters decide keep (true) or drop (false)
function filterSlowSpans(minMs: number): SpanFilterFn {
  return span => span.durationMs >= minMs
}

// Modifiers read and write span data directly
function addEnvironmentTag(): SpanModifierFn {
  return span => {
    span.setAttribute('deployment.environment', process.env.ENVIRONMENT)
  }
}
```

### Custom instrumentations

Using the `defaultInstrumentations` export and `setInstrumentations`, you can set custom instrumentations,
expand on the defaults, or outright replace them with your instrumentation config.

```ts
// Use defaults (no change needed)
initialiseTelemetry({ ... }).startRecording()

// Replace all instrumentations
initialiseTelemetry({ ... })
  .setInstrumentations([new HttpInstrumentation()])
  .startRecording()

// Extend defaults
initialiseTelemetry({ ... })
  .setInstrumentations([...defaultInstrumentations, new RedisInstrumentation()])
  .startRecording()

// Remove specific defaults
initialiseTelemetry({ ... })
  .setInstrumentations(defaultInstrumentations.filter(i => i.instrumentationName !== 'bunyan'))
  .startRecording()
```

## Built-in processors

| Processor | Type | Description |
|---|---|---|
| `filterSpanWhereClient()` | Filter | Drops outgoing HTTP calls (CLIENT spans / `AppDependencies`). Trace context is still propagated. |
| `filterSpanWherePath(paths)` | Filter | Drops requests to specified paths. Supports exact matches and prefix matches ending with `*`. |
| `modifySpanNameWithHttpRoute()` | Modifier | Renames HTTP spans to use the route pattern, e.g. `GET` becomes `GET /users/:id`. |
| `modifySpanWithObfuscation(config)` | Modifier | Obfuscates sensitive data in span attributes using HMAC-SHA256. Same input always produces the same hash for correlation. |

## Developing this package

This module uses rollup, to build:

`npm run lint-fix && npm run build && npm run test`

## Testing changes to this library

- `cd` to this directory and then link this library: `npm link`
- Utilise the in-development library within a project by using: `npm link @ministryofjustice/hmpps-azure-telemetry`
