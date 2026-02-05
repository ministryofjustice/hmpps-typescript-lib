import { logs, SeverityNumber } from '@opentelemetry/api-logs'

import { telemetry } from './client'

const mockEmit = jest.fn()

jest.mock('@opentelemetry/api-logs', () => ({
  logs: {
    getLogger: jest.fn().mockReturnValue({ emit: jest.fn() }),
  },
  SeverityNumber: { INFO: 9 },
}))

describe('telemetry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockEmit.mockClear()
    jest.mocked(logs.getLogger).mockReturnValue({ emit: mockEmit } as never)
  })

  describe('trackEvent()', () => {
    it('should emit a log record with the custom event name', () => {
      // Act
      telemetry.trackEvent('UserLoggedIn')

      // Assert
      expect(mockEmit).toHaveBeenCalledWith({
        severityNumber: SeverityNumber.INFO,
        attributes: {
          'microsoft.custom_event.name': 'UserLoggedIn',
        },
      })
    })

    it('should include additional attributes when provided', () => {
      // Act
      telemetry.trackEvent('UserLoggedIn', { userId: '123', role: 'admin' })

      // Assert
      expect(mockEmit).toHaveBeenCalledWith({
        severityNumber: SeverityNumber.INFO,
        attributes: {
          'microsoft.custom_event.name': 'UserLoggedIn',
          userId: '123',
          role: 'admin',
        },
      })
    })
  })
})
