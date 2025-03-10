import { User } from './User'

/**
 * Represents how we want to authenticate the call:
 * - client: Are we using a system or user token?
 * - user: For system calls, we only need username; for user calls, we only need token.
 */
export interface AuthOptions {
  client: Token
  user: Partial<User>
}

export enum Token {
  USER_TOKEN = 'USER_TOKEN',
  SYSTEM_TOKEN = 'SYSTEM_TOKEN',
}
