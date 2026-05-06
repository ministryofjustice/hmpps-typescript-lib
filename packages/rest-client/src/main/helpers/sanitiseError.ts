import { SanitisedError, type UnsanitisedError } from '../types/Errors'

/**
 * Converts an UnsanitisedError (superagent.ResponseError) into a simpler Error object,
 * omitting request information (e.g. sensitive request headers)
 */
export default function sanitiseError<ErrorData = unknown>(error: UnsanitisedError): SanitisedError<ErrorData> {
  const e = new SanitisedError<ErrorData>()
  const networkError = error as unknown as NodeJS.ErrnoException

  e.message = error.message
  e.stack = <string>error.stack
  e.code = networkError.code
  e.errno = networkError.errno

  if (error.response) {
    e.text = error.response.text
    e.responseStatus = error.response.status
    e.headers = error.response.headers
    e.data = error.response.body
  }

  return e
}
