import { SpanKind } from '@opentelemetry/api'

import type { ModifiableSpan } from '../types/SpanProcessor'
import { modifySpanNameWithHttpRoute } from './modifySpanNameWithHttpRoute'

function createModifiableSpan(attributes: Record<string, string> = {}): ModifiableSpan & { updatedName?: string } {
  const span: ModifiableSpan & { updatedName?: string } = {
    name: 'GET',
    kind: SpanKind.SERVER,
    attributes,
    updateName: (name: string) => {
      span.updatedName = name
    },
    setAttribute: jest.fn(),
  }

  return span
}

describe('modifySpanNameWithHttpRoute()', () => {
  const modifier = modifySpanNameWithHttpRoute()

  it('should rename the span to method + route', () => {
    const span = createModifiableSpan({
      'http.request.method': 'GET',
      'http.route': '/users/:id',
    })
    modifier(span)

    expect(span.updatedName).toBe('GET /users/:id')
  })

  it('should fall back to http.method when http.request.method is not set', () => {
    const span = createModifiableSpan({
      'http.method': 'POST',
      'http.route': '/api/submit',
    })
    modifier(span)

    expect(span.updatedName).toBe('POST /api/submit')
  })

  it('should not rename when route is missing', () => {
    const span = createModifiableSpan({
      'http.request.method': 'GET',
    })
    modifier(span)

    expect(span.updatedName).toBeUndefined()
  })

  it('should not rename when method is missing', () => {
    const span = createModifiableSpan({
      'http.route': '/users/:id',
    })
    modifier(span)

    expect(span.updatedName).toBeUndefined()
  })
})
