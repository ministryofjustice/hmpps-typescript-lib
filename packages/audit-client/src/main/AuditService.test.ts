import AuditService from './AuditService'
import AuditClient from './AuditClient'
import type { AuditClientConfig } from './types/AuditClientConfig'
import { SubjectType } from './types/SubjectType'

jest.mock('./AuditClient')

describe('Audit service', () => {
  let auditClient: jest.Mocked<AuditClient>
  let auditService: AuditService

  beforeEach(() => {
    auditClient = new AuditClient({} as AuditClientConfig, console) as jest.Mocked<AuditClient>
    auditService = new AuditService(auditClient)
  })

  describe('logAuditEvent', () => {
    it('sends audit message using audit client', async () => {
      await auditService.logAuditEvent({
        action: 'AUDIT_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'CRN',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(auditClient.sendMessage).toHaveBeenCalledWith({
        action: 'AUDIT_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'CRN',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })
    })
  })

  describe('logPageView', () => {
    it('sends page view event audit message using audit client', async () => {
      await auditService.logPageView('EXAMPLE_PAGE', {
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'CRN',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(auditClient.sendMessage).toHaveBeenCalledWith({
        action: 'PAGE_VIEW_EXAMPLE_PAGE',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'CRN',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })
    })

    it('Can send different type of subject', async () => {
      type Other = 'LEVEL' | SubjectType
      await auditService.logPageView<Other>('EXAMPLE_PAGE', {
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'LEVEL',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(auditClient.sendMessage).toHaveBeenCalledWith({
        action: 'PAGE_VIEW_EXAMPLE_PAGE',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'LEVEL',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })
    })
    it('Log not applicable subject', async () => {
      await auditService.logPageView('EXAMPLE_PAGE', {
        who: 'user1',
        subjectId: undefined,
        subjectType: 'NOT_APPLICABLE',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(auditClient.sendMessage).toHaveBeenCalledWith({
        action: 'PAGE_VIEW_EXAMPLE_PAGE',
        who: 'user1',
        subjectId: undefined,
        subjectType: 'NOT_APPLICABLE',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })
    })
  })
})
