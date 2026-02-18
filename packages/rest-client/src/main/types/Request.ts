import type superagent from 'superagent'
import type http from 'http'
import { Response as SuperAgentResponse } from 'superagent'
import { ErrorHandler, ErrorLogger } from './Errors'

export interface Request<Response, ErrorData> {
  path: string
  query?: object | string
  headers?: Record<string, string>
  responseType?: string
  retries?: number
  raw?: boolean
  errorHandler?: ErrorHandler<Response, ErrorData>
  retryHandler?: (retry?: boolean) => (err: Error, res: SuperAgentResponse) => boolean | undefined
}

type JsonBody = {
  data?: Record<string, unknown> | string | Array<unknown> | undefined
  multipartData?: never
  files?: never
}

type MultipartBody = {
  data?: never
  multipartData?: object | string[]
  files?: { [key: string]: { buffer: Buffer; originalname: string } }
}

export type RequestWithBody<Response, ErrorData> = Request<Response, ErrorData> & { retry?: boolean } & (
    | JsonBody
    | MultipartBody
  )

export interface StreamRequest<ErrorData> {
  path: string
  headers?: Record<string, string>
  errorLogger?: ErrorLogger<ErrorData>
}

export interface CallContext {
  superagent: superagent.SuperAgent
  token: string | undefined
  agent: http.Agent
}

export interface Call<Response = unknown> {
  (callContex: CallContext): Promise<Response>
}
