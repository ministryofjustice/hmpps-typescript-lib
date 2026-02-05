import { getStringAttribute } from './getStringAttribute'

describe('getStringAttribute()', () => {
  it('should return the value when the key exists and is a string', () => {
    const span = { attributes: { 'http.method': 'GET' } }
    const result = getStringAttribute(span, 'http.method')
    expect(result).toBe('GET')
  })

  it('should return undefined when the key does not exist', () => {
    const span = { attributes: {} }
    const result = getStringAttribute(span, 'http.method')
    expect(result).toBeUndefined()
  })

  it('should return undefined when the value is not a string', () => {
    const span = { attributes: { 'http.status_code': 200 } }
    const result = getStringAttribute(span, 'http.status_code')
    expect(result).toBeUndefined()
  })

  it('should return the first matching string when multiple keys are provided', () => {
    const span = { attributes: { 'http.target': '/old-path', 'url.path': '/new-path' } }
    const result = getStringAttribute(span, 'url.path', 'http.target')
    expect(result).toBe('/new-path')
  })

  it('should fall back to the second key when the first does not exist', () => {
    const span = { attributes: { 'http.target': '/fallback' } }
    const result = getStringAttribute(span, 'url.path', 'http.target')
    expect(result).toBe('/fallback')
  })

  it('should return undefined when none of the keys exist', () => {
    const span = { attributes: { unrelated: 'value' } }
    const result = getStringAttribute(span, 'url.path', 'http.target')
    expect(result).toBeUndefined()
  })
})
