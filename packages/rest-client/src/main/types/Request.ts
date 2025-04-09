import type superagent from 'superagent'
import type http from 'http'
import { SanitisedError } from './Errors'

export interface Request<Response, ErrorData> {
  path: string
  query?: object | string
  headers?: Record<string, string>
  responseType?: string
  retries?: number
  raw?: boolean
  errorHandler?: ErrorHandler<Response, ErrorData>
}

export interface RequestWithBody<Response, ErrorData> extends Request<Response, ErrorData> {
  data?: Record<string, unknown> | string | Array<unknown> | undefined
  retry?: boolean
}

export interface StreamRequest<ErrorData> {
  path: string
  headers?: Record<string, string>
  errorLogger?: ErrorLogger<ErrorData>
}

export interface ErrorHandler<Response, ErrorData> {
  (path: string, method: string, error: SanitisedError<ErrorData>): Response
}

export interface ErrorLogger<ErrorData> {
  (path: string, method: string, error: SanitisedError<ErrorData>): void
}

export interface CallContext {
  superagent: superagent.SuperAgent
  token: string | undefined
  agent: http.Agent
}

export interface Call<Response = unknown> {
  (callContex: CallContext): Promise<Response>
}
