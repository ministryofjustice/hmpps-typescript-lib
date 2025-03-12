import type { Request } from 'express'

export interface AuthenticatedRequest extends Request {
  verified: boolean
  user: {
    username: string
    token: string
    authSource: string
  }
}
