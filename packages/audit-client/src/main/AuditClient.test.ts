import { mockClient } from 'aws-sdk-client-mock'
import { SendMessageCommand, SendMessageCommandInput, SQSClient } from '@aws-sdk/client-sqs'

import AuditClient from './AuditClient'
import type { SqsMessage } from './types/SqsMessage'
import type { AuditClientConfig } from './types/AuditClientConfig'

describe('AuditClient', () => {
  const sqsMock = mockClient(SQSClient)
  let auditClient: AuditClient

  const auditClientConfig: AuditClientConfig = {
    queueUrl: 'http://localhost:4566/000000000000/mainQueue',
    region: 'eu-west-2',
    serviceName: 'hmpps-service',
    enabled: true,
  }

  afterEach(() => {
    sqsMock.reset()
    jest.resetAllMocks()
  })

  describe('sendMessage', () => {
    it('should send sqs message to audit queue', async () => {
      sqsMock.on(SendMessageCommand).resolves({ MessageId: '123' })
      auditClient = new AuditClient(
        {
          ...auditClientConfig,
          queueUrl: 'http://localhost:4566/000000000000/mainQueue',
        },
        console,
      )

      const actualResponse = await auditClient.sendMessage({
        what: 'EXAMPLE_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'CRN',
        correlationId: 'request-123',
        details: { extraDetails: 'example' },
      })

      const expectedSqsMessageBody: SqsMessage = {
        what: 'EXAMPLE_EVENT',
        who: 'user1',
        when: expect.any(String),
        service: 'hmpps-service',
        subjectId: 'subject123',
        subjectType: 'CRN',
        correlationId: 'request-123',
        details: '{"extraDetails":"example"}',
      }

      expect(actualResponse).toEqual({ MessageId: '123' })

      const actualMessageInput = sqsMock.call(0).args[0].input as SendMessageCommandInput

      expect(actualMessageInput.QueueUrl).toEqual('http://localhost:4566/000000000000/mainQueue')

      const actualMessageBody = JSON.parse((actualMessageInput.MessageBody || {}).toString())
      expect(actualMessageBody).toEqual(expectedSqsMessageBody)

      const eventTime = Date.parse(actualMessageBody.when)
      expect(Date.now() - eventTime).toBeLessThan(1000)

      expect(sqsMock.calls().length).toEqual(1)
    })

    it('should include activityId in sqs message when provided', async () => {
      sqsMock.on(SendMessageCommand).resolves({ MessageId: '123' })
      auditClient = new AuditClient(auditClientConfig, console)

      await auditClient.sendMessage({
        what: 'VIEW_REPORT',
        who: 'user1',
        subjectId: 'report-123',
        subjectType: 'REPORT_ID',
        correlationId: 'request-123',
        activityId: 'activity-123',
      })

      const actualMessageInput = sqsMock.call(0).args[0].input as SendMessageCommandInput
      const actualMessageBody = JSON.parse((actualMessageInput.MessageBody || {}).toString())

      expect(actualMessageBody).toEqual({
        what: 'VIEW_REPORT',
        who: 'user1',
        when: expect.any(String),
        service: 'hmpps-service',
        subjectId: 'report-123',
        subjectType: 'REPORT_ID',
        correlationId: 'request-123',
        activityId: 'activity-123',
      })
    })

    it('should omit activityId from sqs message when not provided', async () => {
      sqsMock.on(SendMessageCommand).resolves({ MessageId: '123' })
      auditClient = new AuditClient(auditClientConfig, console)

      await auditClient.sendMessage({
        what: 'LOGIN',
        who: 'user1',
        subjectType: 'NOT_APPLICABLE',
      })

      const actualMessageInput = sqsMock.call(0).args[0].input as SendMessageCommandInput
      const actualMessageBody = JSON.parse((actualMessageInput.MessageBody || {}).toString())

      expect(actualMessageBody).not.toHaveProperty('activityId')
    })

    it.each([
      ['signed session cookie value', 's:oue-67KrJCvkMbanMs4YT3XGEnNGnCYv.pd8aYkHkW+Slz61iLs/dvLeYIdhfG1hjSim1m0RpiRQ'],
      [
        'URL-encoded signed session cookie value',
        's%3Aoue-67KrJCvkMbanMs4YT3XGEnNGnCYv.pd8aYkHkW%2BSlz61iLs%2FdvLeYIdhfG1hjSim1m0RpiRQ',
      ],
    ])('should drop activityId that is a %s and still send the event', async (_, signedSessionId) => {
      sqsMock.on(SendMessageCommand).resolves({ MessageId: '123' })
      const logger = { ...console, warn: jest.fn() }
      auditClient = new AuditClient(auditClientConfig, logger)

      await auditClient.sendMessage({
        what: 'VIEW_REPORT',
        who: 'user1',
        subjectId: 'report-123',
        subjectType: 'REPORT_ID',
        activityId: signedSessionId,
      })

      const actualMessageInput = sqsMock.call(0).args[0].input as SendMessageCommandInput
      const actualMessageBody = JSON.parse((actualMessageInput.MessageBody || {}).toString())

      expect(actualMessageBody).not.toHaveProperty('activityId')
      expect(actualMessageBody.what).toEqual('VIEW_REPORT')
      expect(logger.warn).toHaveBeenCalledTimes(1)
      expect(logger.warn.mock.calls[0].join(' ')).not.toContain(signedSessionId)
    })

    it('should keep a generated activityId that is not in the signed session format', async () => {
      sqsMock.on(SendMessageCommand).resolves({ MessageId: '123' })
      const logger = { ...console, warn: jest.fn() }
      auditClient = new AuditClient(auditClientConfig, logger)

      await auditClient.sendMessage({
        what: 'VIEW_REPORT',
        who: 'user1',
        subjectId: 'report-123',
        subjectType: 'REPORT_ID',
        activityId: '1a8efcc9-4f59-4d55-82d7-6923b390fba5',
      })

      const actualMessageInput = sqsMock.call(0).args[0].input as SendMessageCommandInput
      const actualMessageBody = JSON.parse((actualMessageInput.MessageBody || {}).toString())

      expect(actualMessageBody.activityId).toEqual('1a8efcc9-4f59-4d55-82d7-6923b390fba5')
      expect(logger.warn).not.toHaveBeenCalled()
    })

    it("shouldn't send sqs message to audit queue if client disabled", async () => {
      sqsMock.on(SendMessageCommand).resolves({ MessageId: '123' })
      auditClient = new AuditClient({ ...auditClientConfig, enabled: false }, console)

      await auditClient.sendMessage({
        what: 'EXAMPLE_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'CRN',
      })

      expect(sqsMock.calls().length).toEqual(0)
    })

    it("shouldn't throw an error if sqs message cannot be sent when configured not to", async () => {
      sqsMock.on(SendMessageCommand).rejects(new Error('Error sending sqs message'))
      auditClient = new AuditClient({ ...auditClientConfig }, console)

      await expect(() =>
        auditClient.sendMessage(
          {
            what: 'EXAMPLE_EVENT',
            who: 'user1',
            subjectId: 'subject123',
            subjectType: 'CRN',
          },
          { logOnError: true, throwOnError: false },
        ),
      ).resolves.not.toThrow()

      expect(sqsMock.calls().length).toEqual(1)
    })

    it('should throw an error if sqs message cannot be sent by default', async () => {
      sqsMock.on(SendMessageCommand).rejects(new Error('Error sending sqs message'))
      auditClient = new AuditClient({ ...auditClientConfig }, console)

      await expect(() =>
        auditClient.sendMessage({
          what: 'EXAMPLE_EVENT',
          who: 'user1',
          subjectType: 'NOT_APPLICABLE',
        }),
      ).rejects.toThrow('Error sending sqs message')

      expect(sqsMock.calls().length).toEqual(1)
    })
  })
})
