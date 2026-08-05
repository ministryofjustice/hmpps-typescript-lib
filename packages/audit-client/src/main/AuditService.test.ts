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

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('logAuditEvent', () => {
    it('sends audit message using audit client', async () => {
      await auditService.logAuditEvent({
        action: 'AUDIT_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'CRN',
        correlationId: 'request-123',
        details: { extraDetails: 'example' },
      })

      expect(auditClient.sendMessage).toHaveBeenCalledWith(
        {
          action: 'AUDIT_EVENT',
          who: 'user1',
          subjectId: 'subject123',
          subjectType: 'CRN',
          correlationId: 'request-123',
          details: { extraDetails: 'example' },
        },
        {},
      )
    })
  })

  describe('logPageView', () => {
    it('sends page view event audit message using audit client', async () => {
      await auditService.logPageView('EXAMPLE_PAGE', {
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'CRN',
        correlationId: 'request-123',
        details: { extraDetails: 'example' },
      })

      expect(auditClient.sendMessage).toHaveBeenCalledWith({
        action: 'PAGE_VIEW_EXAMPLE_PAGE',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'CRN',
        correlationId: 'request-123',
        details: { extraDetails: 'example' },
      })
    })

    it('Can send different type of subject', async () => {
      type Other = 'LEVEL' | SubjectType

      const customizedAuditService = new AuditService<string, Other>(auditClient)

      await customizedAuditService.logPageView('EXAMPLE_PAGE', {
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'LEVEL',
        correlationId: 'request-123',
        details: { extraDetails: 'example' },
      })

      expect(auditClient.sendMessage).toHaveBeenCalledWith({
        action: 'PAGE_VIEW_EXAMPLE_PAGE',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'LEVEL',
        correlationId: 'request-123',
        details: { extraDetails: 'example' },
      })
    })

    it('Can send use union for page names', async () => {
      type PageNames = 'PAGE_1' | 'PAGE_2' | 'PAGE_3'

      const customizedAuditService = new AuditService<PageNames, 'LEVEL'>(auditClient)

      await customizedAuditService.logPageView('PAGE_1', {
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'LEVEL',
        correlationId: 'request-123',
        details: { extraDetails: 'example' },
      })

      expect(auditClient.sendMessage).toHaveBeenCalledWith({
        action: 'PAGE_VIEW_PAGE_1',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'LEVEL',
        correlationId: 'request-123',
        details: { extraDetails: 'example' },
      })
    })

    it('Can send use enum for page names', async () => {
      enum PageNames {
        ONE = 'PAGE_1',
        TWO = 'PAGE_2',
      }

      const customizedAuditService = new AuditService<PageNames, 'LEVEL'>(auditClient)

      await customizedAuditService.logPageView(PageNames.ONE, {
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'LEVEL',
        correlationId: 'request-123',
        details: { extraDetails: 'example' },
      })

      expect(auditClient.sendMessage).toHaveBeenCalledWith({
        action: 'PAGE_VIEW_PAGE_1',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'LEVEL',
        correlationId: 'request-123',
        details: { extraDetails: 'example' },
      })
    })

    it('Log not applicable subject', async () => {
      await auditService.logPageView('EXAMPLE_PAGE', {
        who: 'user1',
        subjectId: undefined,
        subjectType: 'NOT_APPLICABLE',
        correlationId: 'request-123',
        details: { extraDetails: 'example' },
      })

      expect(auditClient.sendMessage).toHaveBeenCalledWith({
        action: 'PAGE_VIEW_EXAMPLE_PAGE',
        who: 'user1',
        subjectId: undefined,
        subjectType: 'NOT_APPLICABLE',
        correlationId: 'request-123',
        details: { extraDetails: 'example' },
      })
    })
  })
})
