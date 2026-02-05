import { SpanKind, SpanStatusCode } from '@opentelemetry/api'

import { filterSpanWherePath } from './filterSpanWherePath'

describe('filterSpanWherePath()', () => {
  const spanInfo = (path: string) => ({
    name: 'GET',
    kind: SpanKind.SERVER,
    attributes: { 'url.path': path },
    durationMs: 100,
    status: { code: SpanStatusCode.OK },
  })

  it('should return false for an exact path match', () => {
    const filter = filterSpanWherePath(['/health'])

    const result = filter(spanInfo('/health'))
    expect(result).toBe(false)
  })

  it('should return true when the path does not match', () => {
    const filter = filterSpanWherePath(['/health'])

    const result = filter(spanInfo('/api/users'))
    expect(result).toBe(true)
  })

  it('should return false for a wildcard prefix match', () => {
    const filter = filterSpanWherePath(['/assets/*'])

    const result = filter(spanInfo('/assets/styles.css'))
    expect(result).toBe(false)
  })

  it('should return true when the wildcard prefix does not match', () => {
    const filter = filterSpanWherePath(['/assets/*'])

    const result = filter(spanInfo('/api/data'))
    expect(result).toBe(true)
  })

  it('should match against multiple paths', () => {
    const filter = filterSpanWherePath(['/health', '/ping', '/assets/*'])

    expect(filter(spanInfo('/health'))).toBe(false)
    expect(filter(spanInfo('/ping'))).toBe(false)
    expect(filter(spanInfo('/assets/app.js'))).toBe(false)
    expect(filter(spanInfo('/api/users'))).toBe(true)
  })

  it('should fall back to http.target when url.path is not set', () => {
    const filter = filterSpanWherePath(['/health'])
    const span = {
      name: 'GET',
      kind: SpanKind.SERVER,
      attributes: { 'http.target': '/health' },
      durationMs: 100,
      status: { code: SpanStatusCode.OK },
    }

    const result = filter(span)
    expect(result).toBe(false)
  })

  it('should return true when no path attributes are set', () => {
    const filter = filterSpanWherePath(['/health'])
    const span = {
      name: 'GET',
      kind: SpanKind.SERVER,
      attributes: {},
      durationMs: 100,
      status: { code: SpanStatusCode.OK },
    }

    const result = filter(span)
    expect(result).toBe(true)
  })
})
