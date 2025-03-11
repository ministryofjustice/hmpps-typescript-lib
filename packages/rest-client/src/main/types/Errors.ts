import type { ResponseError } from 'superagent'

/**
 * An error that may be safe to log as it omits sensitive request headers
 */
export class SanitisedError<ErrorData = unknown> extends Error {
  text?: string

  status?: number

  headers?: unknown

  data?: ErrorData
}

export type UnsanitisedError = ResponseError
