import type superagent from 'superagent'
import type http from 'http'
import { SanitisedError, UnsanitisedError } from './Errors'

export interface Request {
  path: string
  query?: object | string
  headers?: Record<string, string>
  responseType?: string
  retries?: number
  raw?: boolean
  errorHandler?: ErrorHandler
}

export interface RequestWithBody extends Request {
  data?: Record<string, unknown> | string | Array<unknown> | undefined
  retry?: boolean
}

export interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  errorLogger?: (e: UnsanitisedError) => void
}

export interface ErrorHandler {
  <Response, ErrorData>(path: string, method: string, error: SanitisedError<ErrorData>): Response
}

export interface CallContext {
  superagent: superagent.SuperAgent
  token: string | undefined
  agent: http.Agent
}

export interface Call<Response = unknown> {
  (callContex: CallContext): Promise<Response>
}
