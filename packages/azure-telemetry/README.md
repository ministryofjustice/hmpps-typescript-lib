# @ministryofjustice/hmpps-azure-telemetry

A shared telemetry package that wraps OpenTelemetry and Azure Application Insights.
Offers a few useful processors and helpers by default.

## Status

**This library is currently: ready to adopt.**

Teams are encouraged to use this library. Please provide feedback via slack to the #typescript channel.

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

### User metadata middleware

Register `telemetryMiddleware.addUserMetadataToTelemetry()` after middleware that populates `res.locals.user`,
including any middleware that retrieves prison user caseload data:

```ts
import { telemetryMiddleware } from '@ministryofjustice/hmpps-azure-telemetry'

app.use(setUpCurrentUser())
app.use(telemetryMiddleware.addUserMetadataToTelemetry())
app.use(routes(services))
```

The middleware adds these attributes to the active span when they have non-empty values:

| Attribute | Source | Description |
|-----------|--------|-------------|
| `userId` | `res.locals.user.userId` | The auth source specific user ID, such as the NOMIS staff ID. |
| `userUuid` | `res.locals.user.userUuid` | The UUID assigned by HMPPS Auth across auth sources. |
| `activeCaseLoadId` | `res.locals.user.activeCaseLoadId` | The active caseload, included only when `authSource` is `nomis`. |

Populate `userUuid` from the access token's `user_uuid` claim in your current user middleware.
The middleware does not decode tokens or fetch user details. It continues the request when user
data is missing or there is no active span.

The options object and its `getAttributes` callback are optional. The callback receives the
request and response on every request and adds or overrides attributes alongside the defaults:

```ts
import type { Request } from 'express'

app.use(telemetryMiddleware.addUserMetadataToTelemetry({
  getAttributes: (req: Request) => ({
    username: req.user?.username,
    auth_source: req.user?.authSource,
  }),
}))
```

You can also read response locals:

```ts
app.use(telemetryMiddleware.addUserMetadataToTelemetry({
  getAttributes: (_req, res) => ({
    username: res.locals?.user?.username,
    auth_source: res.locals?.user?.authSource,
  }),
}))
```

Annotate the callback's request or response parameter with your application's type to access
service-specific fields. The callback runs even when `res.locals.user` is missing, so attributes
can come from any request or response data.

Default identifiers still come from `res.locals.user`. To source them elsewhere, return their
attribute names explicitly:

```ts
app.use(telemetryMiddleware.addUserMetadataToTelemetry({
  getAttributes: (req: Request) => ({
    userId: req.session.user?.userId,
    userUuid: req.session.user?.userUuid,
  }),
}))
```

Attribute values can be strings, numbers or booleans. `undefined` and empty strings are omitted,
while `0` and `false` are retained. Callback values override defaults with the same name, so
returning `{ userId: undefined }` omits `userId`. Returning `{}` preserves the defaults.

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

| Processor                           | Type     | Description                                                                                                               |
|-------------------------------------|----------|---------------------------------------------------------------------------------------------------------------------------|
| `filterSpanWhereClient()`           | Filter   | Drops outgoing HTTP calls (CLIENT spans / `AppDependencies`). Trace context is still propagated.                          |
| `filterSpanWherePath(paths)`        | Filter   | Drops requests to specified paths. Supports exact matches and prefix matches ending with `*`.                             |
| `modifySpanNameWithHttpRoute()`     | Modifier | Renames HTTP spans to use the route pattern, e.g. `GET` becomes `GET /users/:id`.                                         |
| `modifySpanWithObfuscation(config)` | Modifier | Obfuscates sensitive data in span attributes using HMAC-SHA256. Same input always produces the same hash for correlation. |

## Developing this package

This module uses rollup, to build:

`npm run lint-fix && npm run build && npm run test`

## Testing changes to this library

- `cd` to this directory and then link this library: `npm link`
- Utilise the in-development library within a project by using: `npm link @ministryofjustice/hmpps-azure-telemetry`
