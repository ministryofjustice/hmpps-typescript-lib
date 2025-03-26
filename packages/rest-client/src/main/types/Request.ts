import { UnsanitisedError } from './Errors'

export interface Request {
  path: string
  query?: object | string
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
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
