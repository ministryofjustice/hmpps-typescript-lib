import { User } from './User'

/**
 * Represents how we want to authenticate the call:
 * - tokenType: Are we using a system or user token?
 * - user: For system calls, we only need username; for user calls, we only need token.
 */
export interface AuthOptions {
  tokenType: TokenType
  user: Partial<User>
}

export enum TokenType {
  USER_TOKEN = 'USER_TOKEN',
  SYSTEM_TOKEN = 'SYSTEM_TOKEN',
}
