import { SpanKind, SpanStatusCode } from '@opentelemetry/api'

import { filterSpanWhereClient } from './filterSpanWhereClient'

describe('filterSpanWhereClient()', () => {
  const filter = filterSpanWhereClient()

  const spanInfo = (kind: SpanKind) => ({
    name: 'test',
    kind,
    attributes: {},
    durationMs: 100,
    status: { code: SpanStatusCode.OK },
  })

  it('should return false for CLIENT spans', () => {
    const span = spanInfo(SpanKind.CLIENT)

    const result = filter(span)
    expect(result).toBe(false)
  })

  it('should return true for SERVER spans', () => {
    const span = spanInfo(SpanKind.SERVER)

    const result = filter(span)
    expect(result).toBe(true)
  })

  it('should return true for INTERNAL spans', () => {
    const span = spanInfo(SpanKind.INTERNAL)

    const result = filter(span)
    expect(result).toBe(true)
  })
})
