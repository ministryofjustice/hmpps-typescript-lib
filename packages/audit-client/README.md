# @ministryofjustice/hmpps-audit-client

A client library for sending audit events to the HMPPS Audit API via AWS SQS.

## Status

**This library is currently: in BETA.**

This package is under active development and not yet ready for production use.

## Overview

The HMPPS Audit Client provides a standardized way to send audit events from HMPPS services to the central audit system. It handles:

- Sending audit messages to AWS SQS
- Automatic timestamping and service identification
- Type-safe subject types with extensibility
- Flexible error handling
- Convenient methods for common audit patterns (e.g., page views)

## Installation

```bash
npm install @ministryofjustice/hmpps-audit-client
```

## Usage

### Basic Setup

#### Using the Factory (Recommended)

The easiest way to set up the audit client is using the `AuditServiceFactory`, which automatically configures from environment variables:

```typescript
import { AuditServiceFactory } from '@ministryofjustice/hmpps-audit-client'

// Configure from environment variables
const auditService = AuditServiceFactory.configureFromEnv(
  logger, // bunyan Logger or Console
  {}, // Optional SQS client config
)
```

**Required Environment Variables:**

- `AUDIT_ENABLED` - Set to 'true' to enable audit (default: 'true')
- `AUDIT_SQS_REGION` - AWS region (default: 'eu-west-2')
- `AUDIT_SQS_QUEUE_URL` - SQS queue URL (required in production)
- `AUDIT_SERVICE_NAME` - Name of your service (required in production)

#### Manual Configuration

Alternatively, you can configure manually with explicit values:

```typescript
import { AuditServiceFactory } from '@ministryofjustice/hmpps-audit-client'

// Configure with explicit config
const auditService = AuditServiceFactory.createInstance(
  {
    queueUrl: 'https://sqs.eu-west-2.amazonaws.com/123456789/audit-queue',
    region: 'eu-west-2',
    serviceName: 'my-hmpps-service',
    enabled: true,
  },
  logger,
)
```

#### Advanced: Direct Client Usage

For advanced use cases, you can create the client and service separately:

```typescript
import { AuditClient, AuditService } from '@ministryofjustice/hmpps-audit-client'

const auditClient = new AuditClient(
  {
    queueUrl: process.env.AUDIT_SQS_QUEUE_URL,
    region: 'eu-west-2',
    serviceName: 'my-hmpps-service',
    enabled: true,
  },
  logger,
)

const auditService = new AuditService(auditClient)
```

### Logging Audit Events

Most audit events track actions on specific subjects (prisoners, cases, users, etc.):

```typescript
// Log an audit event with a subject
await auditService.logAuditEvent({
  action: 'VIEW_PRISONER',
  who: 'user@example.com',
  subjectType: 'PRISONER_ID',
  subjectId: 'A1234BC',
  correlationId: 'request-123',
  details: { page: 'prisoner-profile' },
})

// Search event
await auditService.logAuditEvent({
  action: 'SEARCH_PRISONER',
  who: 'officer@example.com',
  subjectType: 'SEARCH_TERM',
  subjectId: 'john smith',
  correlationId: 'search-456',
})
```

**Action Naming Conventions:**

- `SEARCH_*` for searches
- `VIEW_*` for viewing records
- `CREATE_*` for creating records
- `EDIT_*` for editing records
- `DELETE_*` for deleting records
- `PRINT_*` for printing
- `DOWNLOAD_*` for downloads

### Logging Page Views

```typescript
// Log a page view (automatically prefixes with 'PAGE_VIEW_')
await auditService.logPageView('PRISONER_PROFILE', {
  who: 'user@example.com',
  subjectType: 'PRISONER_ID',
  subjectId: 'A1234BC',
  correlationId: 'session-456',
  details: { tab: 'personal-details' },
})
```

### Subject Types

The library provides standard subject types:

- `PRISONER_ID` - NOMIS Prisoner reference (for prison services)
- `CRN` - NDelius CRN (for probation services)
- `SEARCH_TERM` - User search queries
- `USER_ID` - Staff member or external user ID
- `NOT_APPLICABLE` - For events without specific subjects

#### Events with Subjects

When you have a subject, provide both `subjectType` and `subjectId`:

```typescript
await auditService.logAuditEvent({
  action: 'VIEW_CASE',
  who: 'probation.officer@example.com',
  subjectType: 'CRN',
  subjectId: 'X123456',
})
```

#### Events without Subjects

For events without a specific subject (e.g., login, logout, system events), use `subjectType: 'NOT_APPLICABLE'`:

```typescript
await auditService.logAuditEvent({
  action: 'LOGIN',
  who: 'user@example.com',
  subjectType: 'NOT_APPLICABLE',
  correlationId: 'session-123',
})
```

**Note:** The `NOT_APPLICABLE` subject type is for events that don't track actions on specific subjects (people, records, etc.). When using `NOT_APPLICABLE`, you cannot provide a `subjectId`.

#### Extending Subject Types

By default you should use one of the existing known `SubjectType`s.

If these don't fit your use-case, talk to the HMPPS Audit & Reporting (HAAR) team about whether you should use a custom one.

If you can't use one of the existing `SubjectType`s, it's possible to extend the standard subject types for service-specific needs:

```typescript
// Define custom subject types
type ExtendedSubjectType = 'COMPONENT_ID' | 'FACILITY_CODE' | SubjectType

// Use with type parameter
await auditService.logAuditEvent<ExtendedSubjectType>({
  action: 'VIEW_FACILITY',
  who: 'admin@example.com',
  subjectType: 'FACILITY_CODE',
  subjectId: 'HMP-LEEDS',
})

// Works with page views too
await auditService.logPageView<ExtendedSubjectType>('COMPONENT_DASHBOARD', {
  who: 'developer@example.com',
  subjectType: 'COMPONENT_ID',
  subjectId: 'hmpps-manage-users',
})
```

### Error Handling

```typescript
// Default behavior: throws on error, no error logging
await auditService.logAuditEvent({
  action: 'CREATE_USER',
  who: 'admin@example.com',
  subjectType: 'USER_ID',
  subjectId: 'user-123',
})

// Custom error handling with AuditClient directly
await auditClient.sendMessage(
  {
    action: 'BACKGROUND_JOB',
    who: 'system',
    subjectType: 'NOT_APPLICABLE',
  },
  {
    logOnError: true, // Log errors to logger
    throwOnError: false, // Don't throw, return null on failure
  },
)
```

### Disabling Audit

Audit can be disabled (useful for local development) by setting the `AUDIT_ENABLED` environment variable:

```bash
export AUDIT_ENABLED=false
```

Or when using manual configuration:

```typescript
const auditService = AuditServiceFactory.createInstance(
  {
    queueUrl: process.env.AUDIT_SQS_QUEUE_URL,
    region: 'eu-west-2',
    serviceName: 'my-service',
    enabled: process.env.NODE_ENV === 'production', // Only in production
  },
  logger,
)
```

When disabled, all `sendMessage` calls return `null` immediately without sending to SQS.

## API Reference

### AuditServiceFactory

Factory for creating configured AuditService instances.

#### Methods

- `configureFromEnv(logger: Logger | Console, clientConfig?: SQSClientConfig): AuditService` - Creates an AuditService from environment variables
- `createInstance(config: AuditClientConfig, logger: Logger | Console): AuditService` - Creates an AuditService with explicit configuration

### AuditService

High-level service for logging audit events.

#### Methods

- `logAuditEvent<T>(event: AuditEvent | AuditEventWithSubject<T>)` - Log any audit event (with or without a subject)
- `logPageView<T>(pageName: string, eventDetails: PageViewEventDetails<T>)` - Log a page view event

### AuditClient

Low-level client for sending audit messages to SQS.

#### Methods

- `sendMessage<T>(event: AuditEvent | AuditEventWithSubject<T>, messageOptions?: MessageOptions)` - Send an audit message to SQS

### Types

- `AuditEvent` - Audit event without a specific subject (requires `subjectType: 'NOT_APPLICABLE'`, cannot have `subjectId`)
- `AuditEventWithSubject<T>` - Audit event with a subject (requires both `subjectType` and `subjectId`)
- `PageViewEventDetails<T>` - Page view event details (union of `AuditEvent` and `AuditEventWithSubject` without the `action` field)
- `SubjectType` - Standard subject type literals (`'PRISONER_ID' | 'CRN' | 'SEARCH_TERM' | 'USER_ID' | 'NOT_APPLICABLE'`)
- `MessageOptions` - Error handling options (`logOnError`, `throwOnError`)
- `AuditClientConfig` - Client configuration

## Development

To build the package:

```bash
npm run build
```

To run tests:

```bash
npm test
```

To lint:

```bash
npm run lint
```

## Best Practices

1. **Use AuditServiceFactory** - Simplifies configuration and manages environment variables automatically
2. **Choose the right subject type:**
   - Use specific subject types (`PRISONER_ID`, `CRN`, `SEARCH_TERM`, `USER_ID`) when tracking actions on specific subjects
   - Use `subjectType: 'NOT_APPLICABLE'` for events without a specific subject (e.g., LOGIN, LOGOUT, system events)
3. **Follow action naming conventions** - Use prefixes: `SEARCH_*`, `VIEW_*`, `CREATE_*`, `EDIT_*`, `DELETE_*`, `PRINT_*`, `DOWNLOAD_*`
4. **Always include correlationId** - Helps link related audit events together (e.g., request ID, session ID)
5. **Use AuditService over AuditClient** - Unless you need custom error handling with `messageOptions`
6. **Don't log sensitive data in details** - The audit system tracks actions, not data. Avoid PII in the `details` field
7. **Talk to HMPPS Audit & Reporting (HAAR) before extending SubjectType** - Ensure new subject types align with audit standards

## License

MIT
