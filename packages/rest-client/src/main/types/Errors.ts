import type { ResponseError } from 'superagent'

/**
 * An error that may be safe to log as it omits sensitive request headers
 */
export class SanitisedError<ErrorData = unknown> extends Error {
  text?: string

  responseStatus?: number

  headers?: Record<string, string>

  data?: ErrorData
}

export type UnsanitisedError = ResponseError

export interface ErrorHandler<Response, ErrorData> {
  (path: string, method: string, error: SanitisedError<ErrorData>): Response
}

export interface ErrorLogger<ErrorData> {
  (path: string, method: string, error: SanitisedError<ErrorData>): void
}

export interface RetryError extends ResponseError {
  code?: string
  crossDomain?: boolean
}
