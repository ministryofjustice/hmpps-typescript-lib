import { AuthOptions, Token } from '../types/AuthOptions'

/**
 * Use a User Token for calls on behalf of a specific user.
 * Example: restClient.get('/some-api', asUser('jwt_token_here'))
 */
export default function asUser(token: string): AuthOptions {
  return {
    client: Token.USER_TOKEN,
    user: { token },
  }
}
