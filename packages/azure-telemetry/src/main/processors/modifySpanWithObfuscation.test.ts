import { SpanKind } from '@opentelemetry/api'

import type { ModifiableSpan } from '../types/SpanProcessor'
import { modifySpanWithObfuscation } from './modifySpanWithObfuscation'

function createModifiableSpan(
  attributes: Record<string, string> = {},
): ModifiableSpan & { setAttributes: Record<string, string> } {
  const setAttributes: Record<string, string> = {}

  return {
    name: 'GET',
    kind: SpanKind.SERVER,
    attributes,
    updateName: jest.fn(),
    setAttribute: (key, value) => {
      setAttributes[key] = value as string
    },
    setAttributes,
  }
}

describe('modifySpanWithObfuscation()', () => {
  it('should hash an entire attribute value', () => {
    const span = createModifiableSpan({ 'enduser.id': 'user-123' })
    const modifier = modifySpanWithObfuscation({
      key: 'test-key',
      rules: [{ attribute: 'enduser.id' }],
    })

    modifier(span)

    expect(span.setAttributes['enduser.id']).toBeDefined()
    expect(span.setAttributes['enduser.id']).not.toBe('user-123')
    expect(span.setAttributes['enduser.id']).toHaveLength(16)
  })

  it('should produce consistent hashes for the same input', () => {
    const span1 = createModifiableSpan({ 'enduser.id': 'user-123' })
    const span2 = createModifiableSpan({ 'enduser.id': 'user-123' })
    const modifier = modifySpanWithObfuscation({
      key: 'test-key',
      rules: [{ attribute: 'enduser.id' }],
    })

    modifier(span1)
    modifier(span2)

    expect(span1.setAttributes['enduser.id']).toBe(span2.setAttributes['enduser.id'])
  })

  it('should produce different hashes for different inputs', () => {
    const span1 = createModifiableSpan({ 'enduser.id': 'user-123' })
    const span2 = createModifiableSpan({ 'enduser.id': 'user-456' })
    const modifier = modifySpanWithObfuscation({
      key: 'test-key',
      rules: [{ attribute: 'enduser.id' }],
    })

    modifier(span1)
    modifier(span2)

    expect(span1.setAttributes['enduser.id']).not.toBe(span2.setAttributes['enduser.id'])
  })

  it('should only hash pattern matches within a value', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    const span = createModifiableSpan({ 'http.url': `/api/users/${uuid}/profile` })
    const modifier = modifySpanWithObfuscation({
      key: 'test-key',
      rules: [
        {
          attribute: 'http.url',
          pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        },
      ],
    })

    modifier(span)

    const result = span.setAttributes['http.url']
    expect(result).toContain('/api/users/')
    expect(result).toContain('/profile')
    expect(result).not.toContain(uuid)
  })

  it('should skip non-string attributes', () => {
    const span = createModifiableSpan()
    ;(span.attributes as Record<string, unknown>)['http.status_code'] = 200
    const modifier = modifySpanWithObfuscation({
      key: 'test-key',
      rules: [{ attribute: 'http.status_code' }],
    })

    modifier(span)

    expect(span.setAttributes['http.status_code']).toBeUndefined()
  })

  it('should skip attributes that do not exist', () => {
    const span = createModifiableSpan({})
    const modifier = modifySpanWithObfuscation({
      key: 'test-key',
      rules: [{ attribute: 'enduser.id' }],
    })

    modifier(span)

    expect(span.setAttributes['enduser.id']).toBeUndefined()
  })
})
