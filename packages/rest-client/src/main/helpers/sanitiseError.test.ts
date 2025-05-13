import { SanitisedError, type UnsanitisedError } from '../types/Errors'
import sanitiseError from './sanitiseError'

describe('sanitised error', () => {
  it('should omit the request headers from the error object', () => {
    const error = {
      name: '',
      status: 404,
      response: {
        req: {
          method: 'GET',
          url: 'https://test-api/endpoint?active=true',
          headers: {
            property: 'not for logging',
          },
        },
        headers: {
          date: 'Tue, 19 May 2020 15:16:20 GMT',
        },
        status: 404,
        statusText: 'Not found',
        text: 'details',
        body: { content: 'hello' },
      },
      message: 'Not Found',
      stack: 'stack description',
    } as unknown as UnsanitisedError

    const e = new SanitisedError()
    e.message = 'Not Found'
    e.text = 'details'
    e.responseStatus = 404
    e.headers = { date: 'Tue, 19 May 2020 15:16:20 GMT' }
    e.data = { content: 'hello' }
    e.stack = 'stack description'

    const sanitisedError = sanitiseError(error)

    expect(sanitisedError).toEqual(e)
  })

  it('should return the error message', () => {
    const error = {
      message: 'error description',
    } as unknown as UnsanitisedError

    const sanitisedError = sanitiseError(error)

    expect(sanitisedError).toBeInstanceOf(SanitisedError)
    expect(sanitisedError).toHaveProperty('message', 'error description')
  })

  it('should return an empty Error instance for an unknown error structure', () => {
    const error = {
      property: 'unknown',
    } as unknown as UnsanitisedError

    const sanitisedError = sanitiseError(error)

    expect(sanitisedError).toBeInstanceOf(SanitisedError)
    expect(sanitisedError).not.toHaveProperty('property')
  })
})
