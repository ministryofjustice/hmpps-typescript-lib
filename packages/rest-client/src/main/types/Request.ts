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

type UnionKeys<T> = T extends T ? keyof T : never
type StrictUnionHelper<T, TAll> = T extends unknown
  ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>>
  : never
type StrictUnion<T> = StrictUnionHelper<T, T>

export type RequestWithBody<Response, ErrorData> = Request<Response, ErrorData> & { retry?: boolean } & StrictUnion<
    | {
        data?: Record<string, unknown> | string | Array<unknown> | undefined
      }
    | {
        multipartData?: object | string[]
        files?: { [key: string]: { buffer: Buffer; originalname: string } }
      }
  >

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
