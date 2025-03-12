import { AuthOptions, TokenType } from '../types/AuthOptions'

/**
 * Generate authentication options for making a request with a system token.
 *
 * Use this function to authenticate API requests with a system token.
 * - If a username is provided, the token will be associated with that user
 *   (useful for auditing or system-initiated actions on behalf of a user).
 * - If no username is provided, an anonymous system token is used
 *   (useful for service-to-service authorization).
 *
 * @param username - (Optional) The username to associate with the system token.
 * @returns AuthOptions - Authentication options configured for a system token.
 *
 * @example
 * // System request associated with a specific user
 * restClient.get('/some-api', asSystem('username'))
 *
 * @example
 * // Anonymous system request
 * restClient.get('/some-api', asSystem())
 */
export default function asSystem(username?: string): AuthOptions {
  return {
    tokenType: TokenType.SYSTEM_TOKEN,
    user: { username },
  }
}
