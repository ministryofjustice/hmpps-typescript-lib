/**
 * Internal SQS message format for HMPPS Audit messages.
 *
 * This interface represents the structure of messages sent to the SQS queue.
 * It includes metadata like service name and timestamp in addition to the audit event data.
 *
 * @internal This is used internally by the audit client and should not be used directly by consumers.
 */
export interface SqsMessage {
  /** The action being audited */
  what: string
  /** Identifier of the user or entity performing the action */
  who: string
  /** ISO 8601 timestamp of when the event occurred */
  when: string
  /** Name of the service that generated the audit event */
  service: string
  /** Optional identifier of the subject of the action */
  subjectId?: string
  /** Optional type of the subject (e.g., 'CRN', 'PRISONER_ID') */
  subjectType?: string
  /** Optional correlation ID for linking related events */
  correlationId?: string
  /** Optional additional details about the event */
  details?: object
}
