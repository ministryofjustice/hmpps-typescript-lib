import { mockClient } from 'aws-sdk-client-mock'
import { SendMessageCommand, SendMessageCommandInput, SQSClient } from '@aws-sdk/client-sqs'

import AuditClient from './AuditClient'
import type { SqsMessage } from './types/SqsMessage'
import type { AuditClientConfig } from './types/AuditClientConfig'

describe('hmppsAuditClient', () => {
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
        action: 'EXAMPLE_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'CRN',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      const expectedSqsMessageBody: SqsMessage = {
        what: 'EXAMPLE_EVENT',
        who: 'user1',
        when: expect.any(String),
        service: 'hmpps-service',
        subjectId: 'subject123',
        subjectType: 'CRN',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
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

    it("shouldn't send sqs message to audit queue if client disabled", async () => {
      sqsMock.on(SendMessageCommand).resolves({ MessageId: '123' })
      auditClient = new AuditClient({ ...auditClientConfig, enabled: false }, console)

      await auditClient.sendMessage({
        action: 'EXAMPLE_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'CRN',
      })

      expect(sqsMock.calls().length).toEqual(0)
    })

    it("shouldn't throw an error if sqs message cannot be sent when configured not to", async () => {
      sqsMock.on(SendMessageCommand).rejects(new Error('Error sending sqs message'))
      auditClient = new AuditClient({ ...auditClientConfig }, console)

      expect(() =>
        auditClient.sendMessage(
          {
            action: 'EXAMPLE_EVENT',
            who: 'user1',
            subjectType: 'NOT_APPLICABLE',
          },
          { logOnError: true, throwOnError: false },
        ),
      ).resolves.not.toThrow()

      expect(sqsMock.calls().length).toEqual(1)
    })

    it('should throw an error if sqs message cannot be sent by default', async () => {
      sqsMock.on(SendMessageCommand).rejects(new Error('Error sending sqs message'))
      auditClient = new AuditClient({ ...auditClientConfig }, console)

      expect(() =>
        auditClient.sendMessage({
          action: 'EXAMPLE_EVENT',
          who: 'user1',
          subjectType: 'NOT_APPLICABLE',
        }),
      ).rejects.toThrow('Error sending sqs message')

      expect(sqsMock.calls().length).toEqual(1)
    })
  })
})
