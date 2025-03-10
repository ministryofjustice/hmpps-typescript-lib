import type { ResponseError } from 'superagent'

export interface SanitisedError extends Error {
  text?: string
  status?: number
  headers?: unknown
  data?: unknown
  stack: string
  message: string
}

export type UnsanitisedError = ResponseError
