import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import type Logger from 'bunyan'
import type { AuditClientConfig } from './types/AuditClientConfig'
import { AuditEvent, AuditEventWithSubject } from './types/AuditEvent'
import { SqsMessage } from './types/SqsMessage'
import { MessageOptions } from './types/MessageOptions'
import { SubjectType } from './types/SubjectType'

/**
 * HMPPS Audit Client for sending audit events to SQS.
 *
 * This client handles the low-level communication with AWS SQS for sending audit messages.
 * It manages the SQS client configuration, message formatting, and error handling.
 *
 * @example
 * ```typescript
 * const auditClient = new HmppsAuditClient(
 *   {
 *     queueUrl: 'https://sqs.eu-west-2.amazonaws.com/123456789/audit-queue',
 *     region: 'eu-west-2',
 *     serviceName: 'my-service',
 *     enabled: true,
 *   },
 *   console
 * );
 *
 * // Send an event with a subject
 * await auditClient.sendMessage({
 *   action: 'VIEW_USER',
 *   who: 'john.doe',
 *   subjectType: 'CRN',
 *   subjectId: 'A123456',
 * });
 *
 * // Send an event without a subject
 * await auditClient.sendMessage({
 *   action: 'LOGIN',
 *   who: 'john.doe',
 *   subjectType: 'NOT_APPLICABLE',
 *   correlationId: 'session-123',
 * });
 * ```
 */
export default class HmppsAuditClient {
  private sqsClient: SQSClient

  private queueUrl: string

  private serviceName: string

  private enabled: boolean

  /**
   * Creates a new HMPPS Audit Client instance.
   *
   * @param config - Configuration for the audit client including SQS queue details
   * @param logger - Logger instance (bunyan Logger or Console) for logging audit operations
   *
   * @example
   * ```typescript
   * const client = new HmppsAuditClient(
   *   {
   *     queueUrl: process.env.AUDIT_SQS_QUEUE_URL,
   *     region: process.env.AUDIT_SQS_REGION,
   *     serviceName: 'my-hmpps-service',
   *     enabled: process.env.AUDIT_ENABLED === 'true',
   *   },
   *   logger
   * );
   * ```
   */
  constructor(
    config: AuditClientConfig,
    private readonly logger: Logger | Console,
  ) {
    this.enabled = config.enabled
    this.queueUrl = config.queueUrl
    this.serviceName = config.serviceName
    this.sqsClient = new SQSClient({ region: config.region, ...config.clientConfig })

    if (!this.enabled) {
      logger.warn(`Auditing is disabled (AUDIT_ENABLED=${process.env.AUDIT_ENABLED}), no messages will be sent.`)
    }
  }

  /**
   * Sends an audit event message to the configured SQS queue.
   *
   * This method formats the audit event into an SQS message and sends it to AWS SQS.
   * It automatically adds service name and timestamp information to the message.
   * Supports both events with subjects and events without subjects (using `subjectType: 'NOT_APPLICABLE'`).
   *
   * @template T - The type of subject being audited, defaults to SubjectType
   * @param event - The audit event to send (AuditEvent or AuditEventWithSubject)
   * @param messageOptions - Options controlling error handling behavior
   * @param messageOptions.logOnError - Whether to log errors (default: false)
   * @param messageOptions.throwOnError - Whether to throw errors (default: true)
   * @returns A promise resolving to the SQS SendMessageCommandOutput or null
   *
   * @throws {Error} If message sending fails and throwOnError is true
   *
   * @example Send an event with a subject
   * ```typescript
   * await client.sendMessage({
   *   action: 'VIEW_PRISONER',
   *   who: 'user@example.com',
   *   subjectType: 'PRISONER_ID',
   *   subjectId: 'A1234BC',
   * });
   * ```
   *
   * @example Send an event without a subject
   * ```typescript
   * await client.sendMessage({
   *   action: 'LOGIN',
   *   who: 'user@example.com',
   *   subjectType: 'NOT_APPLICABLE',
   *   correlationId: 'session-123',
   * });
   * ```
   *
   * @example Custom error handling
   * ```typescript
   * await client.sendMessage(
   *   {
   *     action: 'BACKGROUND_JOB',
   *     who: 'system',
   *     subjectType: 'NOT_APPLICABLE',
   *   },
   *   { logOnError: true, throwOnError: false }
   * );
   * ```
   */
  async sendMessage<T extends string = SubjectType>(
    event: AuditEvent | AuditEventWithSubject<T>,
    messageOptions: MessageOptions = { logOnError: false, throwOnError: true },
  ) {
    if (!this.enabled) return null

    const sqsMessage: SqsMessage = {
      what: event.action,
      who: event.who,
      subjectId: event.subjectId,
      subjectType: event.subjectType,
      correlationId: event.correlationId,
      details: event.details,
      service: this.serviceName,
      when: new Date().toISOString(),
    }

    try {
      const messageResponse = await this.sqsClient.send(
        new SendMessageCommand({ MessageBody: JSON.stringify(sqsMessage), QueueUrl: this.queueUrl }),
      )

      this.logger.info(`HMPPS Audit SQS message sent (${messageResponse.MessageId})`)

      return messageResponse
    } catch (error) {
      if (messageOptions.logOnError) this.logger.error('Error sending HMPPS Audit SQS message', error)
      if (messageOptions.throwOnError) throw error
    }
    return null
  }
}
