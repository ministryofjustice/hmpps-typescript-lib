# Change log

## 1.3.0

`filterSpanWherePath(paths: string[], includeFilteredPathsWithErrors: boolean)` will now record paths that match but error for debugging purposes. Errors can also be dropped by passing `includeFilteredPathsWithErrors: false` into the filter.


## 1.2.0

- Add optional `withProvider` hooks for a sampler, propagator, context manager, extra span processors,
  export processor wrappers and an `afterFlush` callback. Providers, exporters, logging and instrumentation stay library-owned.
- Return a recording handle with `forceFlush()` and `shutdown()`. Existing `flushTelemetry()` callers now flush and
  shut down the actual trace provider, fixing lost final span batches when the global API returns a proxy provider.
- Bound shutdown stages to 10 seconds for trace/log flushing, 5 seconds for `afterFlush`, and 5 seconds for provider shutdown.
  Errors and timeouts are logged; later stages are still attempted. Telemetry still pending at the deadline may be lost.
- Share one shutdown promise across repeated calls, including SIGTERM and SIGINT handlers.
- Apply filters and modifiers once before all processors. With Azure and debug exporters both enabled, modifiers previously ran twice.
- Preserve the existing flush start/completion log messages and log when only a custom provider is enabled.

## 1.1.0

Expose `telemetryMiddleware.addUserMetadataToTelemetry()` middleware to add user IDs and the active NOMIS caseload to telemetry spans,
with an optional `getAttributes(req, res)` callback for custom metadata such as username and auth source.

## 1.0.2

Populate operation name (HTTP method + route) in Bunyan logs so this is available in AppTraces table.

## 1.0.1

Enables Bunyan log sending so application logs publish to the Azure Application Insights AppTraces table.

## 1.0.0

Bumped package version to 1.0.0 for initial production-ready release.

## 0.0.1-alpha.4

Drops support for node engine 20 (no longer maintained) and adds 26 (will be LTS later this year).
