# Change log

## 2.0.0-beta.2

NO_PROXY was being ignored, this has been addressed so it is now also respected and enforced

## 2.0.0

Initial release of newly migrated hmpps-audit-client over to the typescript lib.

### Changes

This version has been mostly rewritten from the standalone hmpps-audit-client and an implementation written into the template project.  

#### New features
The client is now proxy aware, see README for more details.

#### Breaking changes
- Creating the audit service has changed
- No longer logs errors by default

#### The API to create an `auditService` has changed.

Previously the service was automatically configured via environment variables:

```ts
import { auditService} from '@ministryofjustice/hmpps-audit-client'
```

To continue to automatically configure the service from env vars, instantiation is as follows:

```ts
import { AuditServiceFactory } from '@ministryofjustice/hmpps-audit-client'

const auditService = AuditServiceFactory.configureFromEnv(logger)
```

To have more control (using explicit configuration) you can use centralised env var loading and read from `config.ts`

```ts
import config from '../config.ts'
import { AuditServiceFactory } from '@ministryofjustice/hmpps-audit-client'

const auditService = AuditServiceFactory.createInstance(config.sqs.audit, logger)

// config.ts:
{
  sqs: {
    audit: {
      enabled: get('AUDIT_ENABLED', 'true') === 'true',
      queueUrl: get('AUDIT_SQS_QUEUE_URL', 'http://localhost:4566/000000000000/mainQueue', auditEnabled && requiredInProduction),
      serviceName: get('AUDIT_SERVICE_NAME', 'UNASSIGNED', auditEnabled && requiredInProduction),
      region: get('AUDIT_SQS_REGION', 'eu-west-2'),
    }
  }
}
```

View the README.md for more options

#### No longer logs errors by default

By default the library no longer logs audit errors by default - it assumes propagated errors will be logged by the application / default error handler.

This is to follow the paradigm that a log represents a stream of events, and only a single event should be "raised" for a given error and avoids having errors logged multiple times at different layers.
