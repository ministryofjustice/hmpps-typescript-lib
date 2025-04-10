import { SanitisedError, UnsanitisedError } from '../types/Errors'

/**
 * Converts an UnsanitisedError (superagent.ResponseError) into a simpler Error object,
 * omitting request information (e.g. sensitive request headers)
 */
export default function sanitiseError<ErrorData = unknown>(error: UnsanitisedError): SanitisedError<ErrorData> {
  const e = new Error() as SanitisedError<ErrorData>

  e.message = error.message
  e.stack = <string>error.stack

  if (error.response) {
    e.text = error.response.text
    e.responseStatus = error.response.status
    e.headers = error.response.headers
    e.data = error.response.body
  }

  return e
}
