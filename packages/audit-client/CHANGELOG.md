# Change log

## 2.0.0

Initial release of newly migrated hmpps-audit-client over to the typescript lib.

### Breaking changes

There are a few breaking changes:

- Creating the audit service has changed
- When logging page views, `Page` is no longer an enum
- Type-safety improvements around `subjectType` and `subjectId`
- No longer logs errors by default

#### The API to create an `auditService` has changed.

Previously the service was automatically configured via environment variables:

```ts
import { auditService} = from '@ministryofjustice/hmpps-audit-event'
```

To continue to automatically configure the service from env vars, instantiation is as follows:

```ts
import { AuditServiceFactory } = from '@ministryofjustice/hmpps-audit-event'

const auditService = AuditServiceFactory.configureFromEnv(logger)
```

To have more control (more explicit configuration) you can use centralised env var loading and read from `config.ts`

```ts
import config = from '../config.ts'
import { AuditServiceFactory } = from '@ministryofjustice/hmpps-audit-event'

const auditService = AuditServiceFactory.createInstance(config.sqs.audit, logger)

// config.ts:
{
  sqs: {
    audit: {
      enabled: get('AUDIT_ENABLED', 'false') === 'true',
      queueUrl: get('AUDIT_SQS_QUEUE_URL', 'http://localhost:4566/000000000000/mainQueue', auditEnabled && requiredInProduction),
      serviceName: get('AUDIT_SERVICE_NAME', 'UNASSIGNED', auditEnabled && requiredInProduction),
      region: get('AUDIT_SQS_REGION', 'eu-west-2'),
    }
  }
}
```

#### PageType is no longer an enum

PageType is no longer an enum - instead `auditService.logPageView` now takes a raw string as a `page`.
This is because enums are not extensible.

#### Type-safety improvements

`SubjectType` is mandatory now and should be one of a set of known values unless agreed with the HAAR team.

If agreement is made then you can extend SubjectType:

```ts
type ExtendedSubjectType = 'ADDRESS' | SubjectType

// Use with type parameter
await auditService.logAuditEvent<ExtendedSubjectType>({
  action: 'VIEW_FACILITY',
  who: 'admin@example.com',
  subjectType: 'ADDRESS',
  subjectId: '102 Petty France, London, SW1H 9AJ',
})
```

When an event has no `SubjectType` then you can set it to `NOT_APPLICABLE`. In this situation no `subjectId` can be provided.  

#### No longer logs errors by default

By default the library no longer logs audit errors by default - it assumes propagated errors will be logged be the application / default error handler.

This is to follow the paradigm that a log represents a stream of events, and only a single event should be "raised" for a given error and avoids having errors logged multiple times at different layers.
