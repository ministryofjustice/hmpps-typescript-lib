import { getRPCMetadata } from '@opentelemetry/core'
import type { Span } from '@opentelemetry/api'

import { populateOperationNameLogHook } from './populateOperationNameLogHook'

jest.mock('@azure/monitor-opentelemetry-exporter', () => ({
  AI_OPERATION_NAME: 'ai.operation.name',
}))

jest.mock('@opentelemetry/api', () => ({
  context: {
    active: jest.fn(),
  },
}))

jest.mock('@opentelemetry/core', () => ({
  getRPCMetadata: jest.fn(),
}))

const AI_OPERATION_NAME = 'ai.operation.name'

const mockGetRPCMetadata = getRPCMetadata as jest.Mock

function createMockSpan(attributes?: Record<string, string>): Record<string, unknown> {
  return {
    attributes,
  }
}

describe('populateOperationNameLogHook()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should set the operation name when method and route are available', () => {
    const span = createMockSpan({
      'http.request.method': 'GET',
    })
    const record: Record<string, string> = {}
    mockGetRPCMetadata.mockReturnValue({ route: '/users/:id' })

    populateOperationNameLogHook(span as unknown as Span, record)

    expect(record).toEqual({ [AI_OPERATION_NAME]: 'GET /users/:id' })
  })

  it('should fall back to http.method when http.request.method is not set', () => {
    const span = createMockSpan({
      'http.method': 'POST',
    })
    const record: Record<string, string> = {}
    mockGetRPCMetadata.mockReturnValue({ route: '/api/submit' })

    populateOperationNameLogHook(span as unknown as Span, record)

    expect(record).toEqual({ [AI_OPERATION_NAME]: 'POST /api/submit' })
  })

  it('should not set operation name when route is missing', () => {
    const span = createMockSpan({
      'http.request.method': 'GET',
    })
    const record: Record<string, string> = {}
    mockGetRPCMetadata.mockReturnValue({})

    populateOperationNameLogHook(span as unknown as Span, record)

    expect(record).toEqual({})
  })

  it('should not set operation name when method is missing', () => {
    const span = createMockSpan()
    const record: Record<string, string> = {}
    mockGetRPCMetadata.mockReturnValue({ route: '/users/:id' })

    populateOperationNameLogHook(span as unknown as Span, record)

    expect(record).toEqual({})
  })

  it('should not set operation name when both method and route are missing', () => {
    const span = createMockSpan()
    const record: Record<string, string> = {}
    mockGetRPCMetadata.mockReturnValue({})

    populateOperationNameLogHook(span as unknown as Span, record)

    expect(record).toEqual({})
  })
})
