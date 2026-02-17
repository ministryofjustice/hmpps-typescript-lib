import type { SQSClientConfig } from '@aws-sdk/client-sqs'

export interface AuditClientConfig {
  /** URL of the SQS queue to send audit messages to */
  queueUrl: string
  /** AWS region where the SQS queue is located */
  region: string
  /** Name of the service using the audit client */
  serviceName: string
  /** Flag to enable/disable audit sending */
  enabled: boolean
  /** Additional configuration options for the SQS client */
  clientConfig?: SQSClientConfig
}
