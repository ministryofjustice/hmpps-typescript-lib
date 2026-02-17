import HmppsAuditClient from './AuditClient'
import { AuditEvent, AuditEventWithSubject } from './types/AuditEvent'
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
 *   correlationId: 'request-456',
 *   details: { email: 'newuser@example.com' }
 * });
 *
 * // Log an audit event without a subject
 * await auditService.logAuditEvent({
 *   action: 'LOGIN',
 *   who: 'user@example.com',
 *   subjectType: 'NOT_APPLICABLE',
 *   correlationId: 'session-789',
 * });
 *
 * // Log a page view event
 * await auditService.logPageView('USER_PROFILE', {
 *   who: 'user@example.com',
 *   subjectType: 'CRN',
 *   subjectId: 'A123456',
 *   correlationId: 'session-789'
 * });
 * ```
 */
export default class AuditService {
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
   * @template T - The type of subject being audited, defaults to SubjectType but can be extended
   * @param event - The audit event to log (either AuditEvent or AuditEventWithSubject)
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
   * });
   * ```
   *
   * @example With extended subject types
   * ```typescript
   * type ExtendedSubjectTypes = 'COMPONENT_ID' | SubjectType;
   * await auditService.logAuditEvent<ExtendedSubjectTypes>({
   *   action: 'VIEW_COMPONENT',
   *   who: 'user@example.com',
   *   subjectType: 'COMPONENT_ID',
   *   subjectId: 'hmpps-manage-users'
   * });
   * ```
   */
  async logAuditEvent<T extends string = SubjectType>(event: AuditEvent | AuditEventWithSubject<T>) {
    await this.hmppsAuditClient.sendMessage(event)
  }

  /**
   * Logs a page view audit event.
   *
   * This is a convenience method for logging when users view pages in your application.
   * The action is automatically prefixed with 'PAGE_VIEW_'.
   *
   * @template T - The type of subject being viewed, defaults to SubjectType but can be extended
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
   *
   * // Log a page view with extended subject types
   *
   * type ExtendedSubjectTypes = 'COMPONENT' | SubjectType;
   * await auditService.logPageView<ExtendedSubjectTypes>('VIEW_COMPONENT', {
   *   who: 'security@example.com',
   *   subjectType: 'COMPONENT',
   *   subjectId: 'hmpps-manage-users',
   *   details: { }
   * });
   * ```
   */
  async logPageView<T extends string = SubjectType>(pageName: string, eventDetails: PageViewEventDetails<T>) {
    await this.hmppsAuditClient.sendMessage({
      ...eventDetails,
      action: `PAGE_VIEW_${pageName}`,
    })
  }
}
