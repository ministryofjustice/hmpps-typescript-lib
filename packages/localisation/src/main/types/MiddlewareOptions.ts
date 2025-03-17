import type { CookieOptions } from 'express'

export interface MiddlewareOptions {
  cookie: {
    enabled: boolean
    name?: string
  } & CookieOptions
}
