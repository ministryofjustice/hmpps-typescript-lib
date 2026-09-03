import { SubjectType } from './SubjectType'

/**
 * Audit event.
 *
 * Use this type for events that involve a specific subject (e.g., viewing a prisoner, editing a case).
 *
 * @template T - The type of the subject being audited. Defaults to {@link SubjectType}.
 *                Can be extended with custom subject types.
 *
 * @example Basic usage with standard subject types
 * ```typescript
 * const viewEvent: AuditEvent = {
 *   what: 'VIEW_PRISONER',
 *   who: 'officer@example.com',
 *   subjectType: 'PRISONER_ID',
 *   subjectId: 'A1234AA',
 *   correlationId: 'request-123',
 * };
 * ```
 *
 * @example Extended subject types
 * ```typescript
 * type CustomSubjectType = 'COMPONENT_ID' | SubjectType;
 * const customEvent: AuditEvent<CustomSubjectType> = {
 *   what: 'VIEW_COMPONENT',
 *   who: 'developer@example.com',
 *   subjectType: 'COMPONENT_ID',
 *   subjectId: 'hmpps-manage-users',
 * };
 * ```
 */
export interface AuditEvent<T extends string = SubjectType> {
  /**
   * The action being audited.
   * This should be capitalised with underscore separators e.g. VIEW_DPS_USER.
   * Your service can use its own defined values here.
   * Use whatever makes sense within the context of your application, but ideally this will start with SEARCH_, VIEW_, CREATE_, EDIT_, DELETE_,PRINT_,DOWNLOAD_.
   * NB this was previously known as ‘what’
   */
  what: string

  /**
   * Identifier of the user or entity performing the action.
   * This should be the username of the current user.
   */
  who: string

  /**
   * Correlation ID for the event.
   * Not critical, but this is useful for linking multiple audit events to each other.
   */
  correlationId?: string

  /**
   * Additional details about the event.
   * Your service can define what it sends here to provide extra context.
   * If it’s important that you do have a data history for your application then that should be a feature of your service in addition to HMPPS Audit.
   */
  details?: Record<string, unknown>

  /**
   * Type of the subject (e.g., 'CRN').
   * This signifies the type of thing the user is interacting with (eg a Person on Probation, a Search Term).
   * If, for some reason, you do not have a subjectId, please use the subjectType of NOT_APPLICABLE.
   * Also, please get in contact with us to discuss this use case!
   */
  subjectType?: T

  /**
   * Identifier of the subject of the action.
   * This identifies the actual 'thing' the user is interacting with (eg a CRN or the words used in the search term).
   * NB - if you omit the subjectId your subjectType should be set to NOT_APPLICABLE
   */
  subjectId?: string
}
