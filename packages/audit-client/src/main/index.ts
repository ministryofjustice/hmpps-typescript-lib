/**
 * HMPPS Audit Client
 *
 * A client library for sending audit events to the HMPPS Audit API via AWS SQS.
 *
 * @packageDocumentation
 *
 * @example Basic Usage with Factory
 * ```typescript
 * import { AuditServiceFactory } from '@ministryofjustice/hmpps-audit-client';
 *
 * // Configure from environment variables
 * const auditService = AuditServiceFactory.configureFromEnv(logger, {});
 *
 * // Log an audit event with a subject
 * await auditService.logAuditEvent({
 *   action: 'VIEW_PRISONER',
 *   who: 'user@example.com',
 *   subjectType: 'PRISONER_ID',
 *   subjectId: 'A1234BC',
 * });
 *
 * // Log an event without a subject
 * await auditService.logAuditEvent({
 *   action: 'LOGIN',
 *   who: 'user@example.com',
 *   subjectType: 'NOT_APPLICABLE',
 *   correlationId: 'session-123',
 * });
 *
 * // Log a page view
 * await auditService.logPageView('PRISONER_PROFILE', {
 *   who: 'user@example.com',
 *   subjectType: 'PRISONER_ID',
 *   subjectId: 'A1234BC',
 * });
 * ```
 *
 * @example Manual Configuration
 * ```typescript
 * import { AuditServiceFactory } from '@ministryofjustice/hmpps-audit-client';
 *
 * // Create with explicit config
 * const auditService = AuditServiceFactory.createInstance(
 *   {
 *     queueUrl: 'https://sqs.eu-west-2.amazonaws.com/123456789/audit-queue',
 *     region: 'eu-west-2',
 *     serviceName: 'my-service',
 *     enabled: true,
 *   },
 *   logger
 * );
 * ```
 *
 * @example Extended Subject Types
 * ```typescript
 * import type { SubjectType } from '@ministryofjustice/hmpps-audit-client';
 *
 * // Define custom subject types
 * type MySubjectTypes = 'FACILITY_ID' | SubjectType;
 *
 * // Use with type parameter
 * await auditService.logAuditEvent<MySubjectTypes>({
 *   action: 'VIEW_FACILITY',
 *   who: 'admin@example.com',
 *   subjectType: 'FACILITY_ID',
 *   subjectId: 'HMP-123',
 * });
 * ```
 */

export { default as AuditClient } from './AuditClient'
export { default as AuditService } from './AuditService'
export { default as AuditServiceFactory } from './AuditServiceFactory'

export type { AuditEvent, AuditEventWithSubject } from './types/AuditEvent'
export type { SubjectType } from './types/SubjectType'
export type { MessageOptions } from './types/MessageOptions'
export type { AuditClientConfig } from './types/AuditClientConfig'
export type { PageViewEventDetails } from './types/PageViewEventDetails'
