import { AuditEvent, AuditEventWithSubject } from './AuditEvent'
import { SubjectType } from './SubjectType'

/**
 * Details for a page view event.
 *
 * @template T - The type of subject being viewed, defaults to SubjectType
 *
 * @property {string} who - The user or entity that triggered the page view
 * @property {string} [subjectId] - Optional identifier for the subject of the page view - should be provided if subjectType is not 'NOT_APPLICABLE'
 * @property {T} subjectType - Type classification of the subject, constrained to SubjectType by default
 * @property {string} [correlationId] - Optional correlation identifier for linking related events
 * @property {object} [details] - Optional additional details or metadata about the page view
 */
export type PageViewEventDetails<T extends string = SubjectType> =
  | Omit<AuditEvent, 'action'>
  | Omit<AuditEventWithSubject<T>, 'action'>
