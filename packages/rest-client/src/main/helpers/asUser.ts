import { AuthOptions, TokenType } from '../types/AuthOptions'

/**
 * Generate authentication options for making a request with a user token.
 *
 * Use this function to authenticate API requests on behalf of a specific user.
 * The provided token represents the user's identity and permissions, ensuring
 * the request is authorized based on their role/access level.
 *
 * @param token - The JWT access token for the user.
 * @returns AuthOptions - Authentication options configured for a user token.
 *
 * @example
 * restClient.get('/some-api', asUser('jwt_token_here'))
 */
export default function asUser(token: string): AuthOptions {
  return {
    tokenType: TokenType.USER_TOKEN,
    user: { token },
  }
}
