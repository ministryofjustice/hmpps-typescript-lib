import HmppsAuditClient from './AuditClient'
import { AuditEvent } from './types/AuditEvent'
import { MessageOptions } from './types/MessageOptions'
import { PageViewEventDetails } from './types/PageViewEventDetails'
import { SubjectType } from './types/SubjectType'

/**
 * High-level service for sending audit events.
 *
 * This service provides a convenient interface for logging audit events,
 * with specialized methods for common audit patterns like page views.
 *
 * @example
 * ```typescript
 * const auditService = new AuditService(auditClient);
 *
 * // Log an audit event with a subject
 * await auditService.logAuditEvent({
 *   action: 'CREATE_USER',
 *   who: 'admin@example.com',
 *   subjectType: 'USER_ID',
 *   subjectId: 'user-123',
 *   correlationId: 'request-123',
 *   details: { email: 'newuser@example.com' }
 * });
 *
 * // Log an audit event without a subject
 * await auditService.logAuditEvent({
 *   action: 'LOGIN',
 *   who: 'user@example.com',
 *   subjectType: 'NOT_APPLICABLE',
 *   correlationId: 'request-123',
 * });
 *
 * // Log a page view event
 * await auditService.logPageView('USER_PROFILE', {
 *   who: 'user@example.com',
 *   subjectType: 'CRN',
 *   subjectId: 'A123456',
 *   correlationId: 'request-123'
 * });
 * ```
 */
export default class AuditService<PAGE_NAME extends string = string, SUBJECT_TYPE extends string = SubjectType> {
  /**
   * Creates a new AuditService instance.
   *
   * @param hmppsAuditClient - The underlying audit client for sending messages to SQS
   */
  constructor(private readonly hmppsAuditClient: HmppsAuditClient) {}

  /**
   * Logs a generic audit event.
   *
   * Use this method for any audit event. You can log events with or without subjects:
   * - For events with subjects: include both `subjectType` and `subjectId`
   * - For events without subjects: use `subjectType: 'NOT_APPLICABLE'` (cannot include `subjectId`)
   *
   * @param event - The audit event to log (either AuditEvent)
   * @returns A promise that resolves when the message is sent
   *
   * @example Events with subjects
   * ```typescript
   * await auditService.logAuditEvent({
   *   action: 'DELETE_RECORD',
   *   who: 'admin@example.com',
   *   subjectType: 'PRISONER_ID',
   *   subjectId: 'A1234BC',
   *   correlationId: 'request-123',
   *   details: { reason: 'Data correction' }
   * });
   * ```
   *
   * @example Events without subjects
   * ```typescript
   * await auditService.logAuditEvent({
   *   action: 'LOGIN',
   *   who: 'user@example.com',
   *   subjectType: 'NOT_APPLICABLE',
   *   correlationId: 'session-123',
   * },
   *    { logOnError: true, throwOnError: false }););
   * ```
   * ```
   */
  async logAuditEvent(event: AuditEvent<SUBJECT_TYPE>, messageOptions: MessageOptions = {}) {
    await this.hmppsAuditClient.sendMessage(event, messageOptions)
  }

  /**
   * Logs a page view audit event.
   *
   * This is a convenience method for logging when users view pages in your application.
   * The action is automatically prefixed with 'PAGE_VIEW_'.
   *
   * @param pageName - The name/identifier of the page being viewed
   * @param eventDetails - Details about who viewed the page and what they viewed
   * @returns A promise that resolves when the message is sent
   *
   * @example
   * ```typescript
   * // Log a basic page view
   * await auditService.logPageView('PRISONER_PROFILE', {
   *   who: 'officer@example.com',
   *   subjectType: 'PRISONER_ID',
   *   subjectId: 'A1234BC',
   *   correlationId: 'session-123'
   * });
   * ```
   */
  async logPageView(pageName: PAGE_NAME, eventDetails: PageViewEventDetails<SUBJECT_TYPE>) {
    await this.hmppsAuditClient.sendMessage({
      ...eventDetails,
      action: `PAGE_VIEW_${pageName}`,
    })
  }
}
