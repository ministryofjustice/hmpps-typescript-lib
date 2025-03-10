import { SanitisedError, UnsanitisedError } from '../types/Errors'

export default function sanitiseError(error: UnsanitisedError): SanitisedError {
  const e = new Error() as SanitisedError
  e.message = error.message
  e.stack = <string>error.stack
  if (error.response) {
    e.text = error.response.text
    e.status = error.response.status
    e.headers = error.response.headers
    e.data = error.response.body
  }
  return e
}
